import torch
from diffusers import StableDiffusionPipeline, StableDiffusionInpaintPipeline, StableDiffusionImg2ImgPipeline
from io import BytesIO
from PIL import Image
from pathlib import Path
import base64
import uuid

from publisher import WorkerResponseType

path = Path(__file__).parent.absolute().joinpath('models')


class ImageGenerator:

    def _generate_image_name(self, prompt, extension):
        return prompt.strip().replace(" ", "-") + "-" + str(uuid.uuid4())[:6] + extension

    def __init__(self, publisher):
        self._publisher = publisher

        # Set device
        torch_device = "cuda" if torch.cuda.is_available() else "cpu"
        if (torch_device == "cpu"):
            raise Exception("No GPU available")

        # self._inpaint_pipeline = StableDiffusionInpaintPipeline.from_pretrained(
        #     "runwayml/stable-diffusion-inpainting", torch_dtype=torch.float16
        # ).to(torch_device)

        self._text_to_image_pipeline = StableDiffusionPipeline.from_pretrained(
            "CompVis/stable-diffusion-v1-4", revision="fp16", torch_dtype=torch.float16
        ).to(torch_device)

        # self._image_to_image_pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
        #     "CompVis/stable-diffusion-v1-4", revision="fp16", torch_dtype=torch.float16
        # ).to(torch_device)

    def text_to_image(self, user_id, prompt, height, width, steps, seed=torch.manual_seed(32)):
        image = self._text_to_image_pipeline(
            prompt=prompt,
            height=height,
            width=width,
            num_inference_steps=steps
        ).images[0]

        # save the image
        filename = self._generate_image_name(prompt, ".jpg")
        image.save(Path(__file__).parent.parent.absolute().joinpath(
            'images').joinpath(filename))

        # notify API the image has been saved
        message = {
            "type": WorkerResponseType.IMAGE_INFO,
            "filename": filename,
            "userId": user_id
        }
        self._publisher.publish(message)

    def image_to_image(self, user_id, image, prompt, steps, strength=0.75, seed=None):

        image = bytes(image, 'utf-8')
        image = image[image.find(b'/9'):]
        # image encoded as a byte64 string
        input_image = Image.open(
            BytesIO(base64.b64decode(image))).convert("RGB")
        input_image = input_image.resize((512, 512))

        output_image = self._image_to_image_pipeline(
            prompt=prompt, image=input_image, strength=strength, num_inference_steps=steps).images[0]

        filename = "i2i" + self._generate_image_name(prompt, ".jpg")

        output_image.save(Path(__file__).parent.parent.absolute().joinpath(
            'images').joinpath(filename))


        generator = torch.Generator(device="cuda").manual_seed(1024)
        # notify API the image has been saved
        message = {
            "type": WorkerResponseType.IMAGE_INFO,
            "filename": filename,
            "userId": user_id
        }
        self._publisher.publish(message)
