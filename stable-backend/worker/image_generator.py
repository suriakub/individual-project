import torch
from diffusers import StableDiffusionPipeline, StableDiffusionInpaintPipeline, StableDiffusionImg2ImgPipeline, AutoencoderKL, UNet2DConditionModel, LMSDiscreteScheduler, PNDMScheduler
from transformers import CLIPTextModel, CLIPTokenizer
from io import BytesIO
from PIL import Image
from pathlib import Path
import base64
import uuid

from publisher import WorkerResponseType, Publisher

MODEL = "runwayml/stable-diffusion-v1-5"


class ImageGenerator:

    def __init__(self, publisher: Publisher):
        self._publisher = publisher

        if torch.has_mps:
            device = "mps"
        elif torch.cuda.is_available():
            device = "cuda"
        else:
            raise RuntimeError("No GPU available")

        vae = AutoencoderKL.from_pretrained(
            MODEL, subfolder="vae", revision="fp16", torch_dtype=torch.float16).to(device)
        print("Autoencoder loaded.")
        text_encoder = CLIPTextModel.from_pretrained(
            MODEL, subfolder="text_encoder", revision="fp16", torch_dtype=torch.float16).to(device)
        print("Text encoder loaded.")
        tokenizer = CLIPTokenizer.from_pretrained(
            MODEL, subfolder="tokenizer", revision="fp16", torch_dtype=torch.float16)
        print("Tokenizer loaded.")
        unet = UNet2DConditionModel.from_pretrained(
            MODEL, subfolder="unet", revision="fp16", torch_dtype=torch.float16).to(device)
        print("U-Net loaded.")
        scheduler = PNDMScheduler.from_pretrained(
            MODEL, subfolder="scheduler"
        )
        print("Scheduler loaded.")

        self._vae = vae

        # self._inpaint_pipeline = StableDiffusionInpaintPipeline.from_pretrained(
        #     "runwayml/stable-diffusion-inpainting", torch_dtype=torch.float16
        # ).to(torch_device)

        self._text_to_img_pipeline = StableDiffusionPipeline(
            vae, text_encoder, tokenizer, unet, scheduler, None, None, False).to(device)
        print("Text to Image pipeline ready.")

        self._img_to_img_pipeline = StableDiffusionImg2ImgPipeline(
            vae, text_encoder, tokenizer, unet, scheduler, None, None, False).to(device)
        print("Image to Image pipeline ready.")

    def _decode_latents(self, latents: torch.FloatTensor):
        latents = 1 / 0.18215 * latents
        image = self._vae.decode(latents).sample
        image = (image / 2 + 0.5).clamp(0, 1)
        # we always cast to float32 as this does not cause significant overhead and is compatible with bfloa16
        image = image.cpu().permute(0, 2, 3, 1).float().numpy()

        images = image
        if images.ndim == 3:
            images = images[None, ...]
        images = (images * 255).round().astype("uint8")
        if images.shape[-1] == 1:
            # special case for grayscale (single channel) images
            pil_images = [Image.fromarray(
                image.squeeze(), mode="L") for image in images]
        else:
            pil_images = [Image.fromarray(image) for image in images]

        return pil_images[0]

    # https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/text2img#diffusers.StableDiffusionPipeline.__call__.callback
    def _report_image_progress(self, user_id: int, prompt: str, total_steps: int, generate_name, decode_latents):
        def report_progress(step: int, timestep: int, latents: torch.FloatTensor):
            # save the image
            filename = generate_name(prompt + '_' + str(step), ".jpg")
            image = decode_latents(latents)
            image.save(Path(__file__).parent.parent.absolute().joinpath(
                'images').joinpath(filename))

            message = {
                "type": WorkerResponseType.IMAGE_INFO,
                "filename": filename,
                "progress": int(step / total_steps * 100),
                "username": user_id,
            }
            self._publisher.publish(message)

        return report_progress

    def _generate_image_name(self, prompt: str, extension: str):
        return prompt.strip().replace(" ", "-") + "-" + str(uuid.uuid4())[:6] + extension

    def text_to_image(self, user_id: int, prompt: str, height: int, width: int, steps: int, seed=torch.manual_seed(32)):
        image = self._text_to_img_pipeline(
            prompt=prompt,
            height=height,
            width=width,
            num_inference_steps=steps,
            callback=self._report_image_progress(
                user_id, prompt, steps, self._generate_image_name, self._decode_latents
            ),
            callback_steps=steps//10
        ).images[0]

        # save the image
        filename = self._generate_image_name(prompt, ".jpg")
        image.save(Path(__file__).parent.parent.absolute().joinpath(
            'images').joinpath(filename))

        # notify API the image has been saved
        message = {
            "type": WorkerResponseType.IMAGE_INFO,
            "filename": filename,
            "username": user_id,
            "progress": 100
        }
        self._publisher.publish(message)

    def image_to_image(self, user_id: int, image: str, prompt: str, steps: int, strength=0.75, seed=torch.manual_seed(32)):
        # image encoded as a byte64 string
        image = bytes(image, 'utf-8')
        image = image[image.find(b'/9'):]
        input_image = Image.open(
            BytesIO(base64.b64decode(image))).convert("RGB")
        input_image = input_image.resize((512, 512))

        output_image = self._img_to_img_pipeline(
            prompt=prompt,
            image=input_image,
            strength=strength,
            num_inference_steps=steps,
            callback=self._report_image_progress(
                user_id, prompt, steps, self._generate_image_name, self._decode_latents
            ),
            callback_steps=steps//10
        ).images[0]

        filename = "i2i-" + self._generate_image_name(prompt, ".jpg")

        output_image.save(Path(__file__).parent.parent.absolute().joinpath(
            'images').joinpath(filename))

        # notify API the image has been saved
        message = {
            "type": WorkerResponseType.IMAGE_INFO,
            "filename": filename,
            "username": user_id,
            "progress": 100
        }
        self._publisher.publish(message)


# What we need to do on a practical level is to:
#  - change Image-to-Image pipeline from diffusers
#  - make it not add noise to images before generation
#  - make it finish in a correct number of steps