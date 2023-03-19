import numpy as np
import PIL.ImageOps
from utils.image import latents_to_pil
from pipelines.diffusion_pipeline import DiffusionPipeline
import torch
from tqdm.auto import tqdm


class ImageToImagePipeline(DiffusionPipeline):
    def __init__(self, vae, text_encoder, tokenizer, unet, scheduler, device, torch_dtype):
        super().__init__(vae, text_encoder, tokenizer, unet, scheduler, device, torch_dtype)
        print("Image to Image pipeline ready.")

    def __call__(self, prompt, image, strength, steps, callback, seed=None, guidance_scale=7.5):
        seed = torch.cuda.manual_seed(seed) if seed is not None else seed

        # Prep text
        text_embeddings = self._encode_prompt(prompt)

        # Preprocess the input image
        image = self._preprocess_image(image)

        # Prep Scheduler
        self._scheduler.set_timesteps(steps)
        timesteps, new_steps = self._get_timesteps(steps, strength)
        latent_timestep = timesteps[:1].repeat(1)

        latents = self._prepare_latents(image, latent_timestep, seed)

        # Denoising loop
        with torch.autocast(self._device, self._torch_dtype):
            for i, t in tqdm(enumerate(timesteps)):
                sigma = self._scheduler.sigmas[i + steps - new_steps]

                # expand the latents if we are doing classifier-free guidance to avoid doing two forward passes.
                latent_model_input = torch.cat([latents] * 2)
                latent_model_input = self._scheduler.scale_model_input(
                    latent_model_input, t)

                # predict the noise residual
                with torch.no_grad():
                    noise_pred = self._unet(
                        latent_model_input, t, encoder_hidden_states=text_embeddings).sample

                # perform guidance
                noise_pred_uncond, noise_pred_text = noise_pred.chunk(2)
                noise_pred = noise_pred_uncond + guidance_scale * \
                    (noise_pred_text - noise_pred_uncond)

                latents_noiseless = latents - sigma * noise_pred

                # compute the previous noisy sample
                latents = self._scheduler.step(
                    noise_pred, t, latents).prev_sample

                # call the callback
                if i % self._image_frequency == 0 or i == len(timesteps) - 1:
                    image = latents_to_pil(latents_noiseless, self._vae)
                    callback(i + 1 + steps - new_steps, image)

        # scale and decode the image latents with vae
        return latents_to_pil(latents, self._vae)

    def _preprocess_image(self, image):
        if isinstance(image, PIL.Image.Image):
            image = [image]
        w, h = image[0].size
        w, h = map(lambda x: x - x % 8, (w, h))

        image = [np.array(i.resize((w, h), resample=PIL.Image.Resampling.LANCZOS))[
            None, :] for i in image]
        image = np.concatenate(image, axis=0)
        image = np.array(image).astype(np.float32) / 255.0
        image = image.transpose(0, 3, 1, 2)
        image = 2.0 * image - 1.0
        image = torch.from_numpy(image)
        return image

    def _get_timesteps(self, steps, strength):
        init_timestep = min(
            int(steps * strength), steps)

        t_start = max(steps - init_timestep, 0)
        timesteps = self._scheduler.timesteps[t_start:]

        return timesteps, steps - t_start

    def _prepare_latents(self, image, timestep, seed):

        image = image.to(device=self._device, dtype=self._torch_dtype)
        with torch.no_grad():
            init_latents = self._vae.encode(
                image).latent_dist.sample(seed)
        init_latents = 0.18215 * init_latents
        init_latents = torch.cat([init_latents], dim=0)
        noise = torch.randn(init_latents.shape,
                            device=self._device, dtype=self._torch_dtype, generator=seed).to(self._device)
        init_latents = self._scheduler.add_noise(init_latents, noise, timestep)
        return init_latents
