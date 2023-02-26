from utils.image import generate_image_name, image_from_string
import torch
from diffusers import StableDiffusionInpaintPipeline, AutoencoderKL, UNet2DConditionModel, LMSDiscreteScheduler
from transformers import CLIPTextModel, CLIPTokenizer
from tqdm.auto import tqdm
from torchvision import transforms as tfms
from pathlib import Path
from pipelines.text_to_image import TextToImagePipeline
from pipelines.image_to_image import ImageToImagePipeline

from publisher import WorkerResponseType, Publisher

# TODO: load from env variable
MODEL = "runwayml/stable-diffusion-v1-5"
USE_FLOAT16 = True


class ImageGenerator:

    def __init__(self, publisher: Publisher):
        self._publisher = publisher

        if torch.has_mps:
            device = "mps"
            print("MPS compatible GPU found.")
        elif torch.cuda.is_available():
            device = "cuda"
            print("CUDA compatible GPU found.")
        else:
            raise RuntimeError("No GPU available")

        if USE_FLOAT16:
            tensor_precision = torch.float16
        else:
            tensor_precision = torch.float32

        print("Loading models...")

        vae = AutoencoderKL.from_pretrained(
            MODEL, subfolder="vae", revision="fp16", torch_dtype=tensor_precision).to(device)
        print("Autoencoder loaded.")

        text_encoder = CLIPTextModel.from_pretrained(
            MODEL, subfolder="text_encoder", revision="fp16", torch_dtype=tensor_precision).to(device)
        print("Text encoder loaded.")

        tokenizer = CLIPTokenizer.from_pretrained(
            MODEL, subfolder="tokenizer", revision="fp16", torch_dtype=tensor_precision)
        print("Tokenizer loaded.")

        unet = UNet2DConditionModel.from_pretrained(
            MODEL, subfolder="unet", revision="fp16", torch_dtype=tensor_precision).to(device)
        print("U-Net loaded.")

        scheduler = LMSDiscreteScheduler.from_pretrained(
            MODEL, subfolder="scheduler"
        )
        print("Scheduler loaded.")

        self._vae = vae

        # self._inpaint_pipeline = StableDiffusionInpaintPipeline.from_pretrained(
        #     "runwayml/stable-diffusion-inpainting", torch_dtype=torch.float16
        # ).to(torch_device)

        self._text_to_img_pipeline = TextToImagePipeline(
            vae, text_encoder, tokenizer, unet, scheduler, device)

        self._img_to_img_pipeline = ImageToImagePipeline(
            vae, text_encoder, tokenizer, unet, scheduler, device
        )

    def _report_image_progress(self, user_id: int, prompt: str, total_steps: int):
        def fn(step: int, image):
            filename = generate_image_name(prompt + '_' + str(step))
            image.save(Path(__file__).parent.parent.absolute().joinpath(
                'images').joinpath(filename))

            message = {
                "type": WorkerResponseType.IMAGE_INFO,
                "filename": filename,
                "progress": int(step / total_steps * 100),
                "username": user_id,
            }
            self._publisher.publish(message)

        return fn

    def text_to_image(self, user_id: int, prompt: str, height: int, width: int, steps: int, seed=torch.manual_seed(32)):
        image = self._text_to_img_pipeline(
            prompt=prompt,
            height=height,
            width=width,
            steps=steps,
            callback=self._report_image_progress(user_id, prompt, steps),
            callback_steps=2
        )

        # save the image
        filename = generate_image_name(prompt)
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
        input_image = image_from_string(image).resize((512, 512))

        output_image = self._img_to_img_pipeline(
            prompt=prompt,
            image=input_image,
            strength=strength,
            steps=steps,
            callback=self._report_image_progress(user_id, prompt, steps),
            callback_steps=2
        )

        filename = "i2i-" + generate_image_name(prompt)

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
