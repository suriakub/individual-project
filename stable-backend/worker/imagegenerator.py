import torch
from transformers import CLIPTextModel, CLIPTokenizer
from diffusers import AutoencoderKL, UNet2DConditionModel, LMSDiscreteScheduler, StableDiffusionPipeline
from tqdm.auto import tqdm
from torch import autocast
from PIL import Image
from torchvision import transforms as tfms
from pathlib import Path
import uuid

from publisher import WorkerResponseType

path = Path(__file__).parent.absolute().joinpath('models')

class ImageGenerator:

    def __init__(self, publisher):
        # Check if we have a gpu
        if not torch.cuda.is_available():
            raise Exception("No GPU available.")

        print('Loading models...')
        vae = AutoencoderKL.from_pretrained(path.joinpath("vae"), torch_dtype=torch.float16, revision="fp16")
        tokenizer = CLIPTokenizer.from_pretrained(path.joinpath("tokenizer"), torch_dtype=torch.float16, revision="fp16")
        text_encoder = CLIPTextModel.from_pretrained(path.joinpath("text_encoder"), torch_dtype=torch.float16, revision="fp16")
        unet = UNet2DConditionModel.from_pretrained(path.joinpath("unet"), torch_dtype=torch.float16, revision="fp16")
        print('Models loaded.')

        self._scheduler = LMSDiscreteScheduler(beta_start=0.00085, beta_end=0.012, beta_schedule="scaled_linear", num_train_timesteps=1000)
        self._tokenizer = tokenizer
        self._text_encoder = text_encoder.to("cuda")
        self._vae = vae.to("cuda")
        self._unet = unet.to("cuda")
        self._publisher = publisher


    def text_to_image(self, user_id, prompt, height, width, steps, seed=None):
        guidance_scale = 7.5
        batch_size = 1
        prompt = prompt

        # Prep text 
        text_input = self._tokenizer(prompt, padding="max_length", max_length=self._tokenizer.model_max_length, truncation=True, return_tensors="pt")
        with torch.no_grad():
            text_embeddings = self._text_encoder(text_input.input_ids.to("cuda"))[0]

        max_length = text_input.input_ids.shape[-1]
        uncond_input = self._tokenizer(
            [""] * batch_size, padding="max_length", max_length=max_length, return_tensors="pt"
        )

        with torch.no_grad():
            uncond_embeddings = self._text_encoder(uncond_input.input_ids.to("cuda"))[0] 
        text_embeddings = torch.cat([uncond_embeddings, text_embeddings])

        # Prep Scheduler
        self._scheduler.set_timesteps(steps)

        # Prep latents
        latents = torch.randn(
            (batch_size, self._unet.in_channels, height // 8, width // 8),
            generator=seed, dtype=text_embeddings.dtype
        )
        latents = latents.to("cuda")
        latents = latents * self._scheduler.sigmas[0] # Need to scale to match k

        # Loop
        with autocast("cuda"):
            for i, t in tqdm(enumerate(self._scheduler.timesteps)):

                # publish progress
                if (i != 0 and steps != 0 and i % (steps // 10) == 0):
                    self._publisher.publish({"type": WorkerResponseType.PROGRESS, "progress": 100 * i // steps, "userId": user_id})
                
                # expand the latents if we are doing classifier-free guidance to avoid doing two forward passes.
                latent_model_input = torch.cat([latents] * 2)
                sigma = self._scheduler.sigmas[i]
                latent_model_input = latent_model_input / ((sigma**2 + 1) ** 0.5)

                # predict the noise residual
                with torch.no_grad():
                    noise_pred = self._unet(latent_model_input, t, encoder_hidden_states=text_embeddings).sample

                # perform guidance
                noise_pred_uncond, noise_pred_text = noise_pred.chunk(2)
                noise_pred = noise_pred_uncond + guidance_scale * (noise_pred_text - noise_pred_uncond)

                # compute the previous noisy sample x_t -> x_t-1
                latents = self._scheduler.step(noise_pred, i, latents)["prev_sample"]

        # scale and decode the image latents with vae
        latents = 1 / 0.18215 * latents

        with torch.no_grad():
            image = self._vae.decode(latents).sample
        
        image = (image / 2 + 0.5).clamp(0, 1)
        image = image.detach().cpu().permute(0, 2, 3, 1).float().numpy()
        image = (image * 255).round().astype("uint8")
        image = Image.fromarray(image[0])

        filename = self._generate_image_name(prompt, ".jpg")
        image.save(Path(__file__).parent.parent.absolute().joinpath('images').joinpath(filename))

        # notify API the image has been saved
        message = {
            "type": WorkerResponseType.IMAGE_INFO, 
            "filename": filename, 
            "userId": user_id
        }
        self._publisher.publish(message)


    def _generate_image_name(self, prompt, extension):
        return prompt.strip().replace(" ", "-") + "-" + str(uuid.uuid4())[:6] + extension


    # def __init__(self, publisher):
    #     self._publisher = publisher
    #     # Set device
    #     torch_device = "cuda" if torch.cuda.is_available() else "cpu" 
    #     if (torch_device == "cpu"):
    #         raise Exception("No GPU available")
    #     pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4", revision="fp16", torch_dtype=torch.float16)
    #     self._pipeline = pipe.to("cuda")

    
    # def text_to_image(self, prompt, height, width, steps, seed=torch.manual_seed(32)):
    #     image = self._pipeline(
    #         prompt=prompt,
    #         height=height,
    #         width=width,
    #         num_inference_steps=steps
    #     ).images[0]

    #     # save the image
    #     filename = self._generate_image_name(prompt, ".jpg")
    #     image.save("../images/" + filename)

    #     # notify API the image has been saved
    #     message = {"filename": filename}
    #     self._publisher.publish(message)