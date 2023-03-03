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

class ImageGenerator:

    def __init__(self, publisher: Publisher, model: str, torch_dtype):
        self._publisher = publisher

        if torch.has_mps:
            device = "mps"
            print("MPS compatible GPU found.")
        elif torch.cuda.is_available():
            device = "cuda"
            print("CUDA compatible GPU found.")
        else:
            raise RuntimeError("No GPU available")

        print("Loading models...")

        vae = AutoencoderKL.from_pretrained(
            model, subfolder="vae", revision="fp16", torch_dtype=torch_dtype).to(device)
        print("Autoencoder loaded.")

        text_encoder = CLIPTextModel.from_pretrained(
            model, subfolder="text_encoder", revision="fp16", torch_dtype=torch_dtype).to(device)
        print("Text encoder loaded.")

        tokenizer = CLIPTokenizer.from_pretrained(
            model, subfolder="tokenizer", revision="fp16", torch_dtype=torch_dtype)
        print("Tokenizer loaded.")

        unet = UNet2DConditionModel.from_pretrained(
            model, subfolder="unet", revision="fp16", torch_dtype=torch_dtype).to(device)
        print("U-Net loaded.")

        scheduler = LMSDiscreteScheduler.from_pretrained(
            model, subfolder="scheduler"
        )
        print("Scheduler loaded.")

        self._vae = vae

        # self._inpaint_pipeline = StableDiffusionInpaintPipeline.from_pretrained(
        #     "runwayml/stable-diffusion-inpainting", torch_dtype=torch.float16
        # ).to(torch_device)

        self._text_to_img_pipeline = TextToImagePipeline(
            vae, text_encoder, tokenizer, unet, scheduler, device, torch_dtype
        )

        self._img_to_img_pipeline = ImageToImagePipeline(
            vae, text_encoder, tokenizer, unet, scheduler, device, torch_dtype
        )

    def _report_image_progress(self, user_id: int, prompt: str, total_steps: int):
        def fn(step: int, image):
            filename = generate_image_name(prompt + '_' + str(step))
            image.save(Path(__file__).parent.parent.absolute().joinpath(
                'images').joinpath(filename))

            message = {
                "type": WorkerResponseType.IMAGE_INFO,
                "filename": filename,
                "step": step,
                "totalSteps": total_steps,
                "username": user_id,
            }
            self._publisher.publish(message)

        return fn

    def text_to_image(self, username: int, prompt: str, height: int, width: int, steps: int, seed=torch.manual_seed(32)):
        self._text_to_img_pipeline(
            prompt=prompt,
            height=height,
            width=width,
            steps=steps,
            callback=self._report_image_progress(username, prompt, steps),
        )

    def image_to_image(self, username: int, image: str, prompt: str, steps: int, strength=0.75, seed=torch.manual_seed(32)):
        input_image = image_from_string(image).resize((512, 512))

        self._img_to_img_pipeline(
            prompt=prompt,
            image=input_image,
            strength=strength,
            steps=steps,
            callback=self._report_image_progress(username, prompt, steps),
        )
