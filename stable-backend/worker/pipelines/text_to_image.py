from pipelines.diffusion_pipeline import DiffusionPipeline
from utils.image import latents_to_pil

import torch
from tqdm.auto import tqdm


class TextToImagePipeline(DiffusionPipeline):
    def __init__(self, vae, text_encoder, tokenizer, unet, scheduler, device, torch_dtype):
        super().__init__(vae, text_encoder, tokenizer, unet, scheduler, device, torch_dtype)
        print("Text to Image pipeline ready.")

    def __call__(self, prompt, height, width, steps, callback, seed=None, guidance_scale=7.5):
        # Prep text
        text_embeddings = self._encode_prompt(prompt)

        # Prep Scheduler
        self._scheduler.set_timesteps(steps)

        # Prep latents
        latents = torch.randn(
            (1, self._unet.in_channels, height // 8, width // 8),
            generator=seed, dtype=text_embeddings.dtype
        )
        latents = latents.to(self._device)
        latents = latents * self._scheduler.sigmas[0]

        # Denoising loop
        with torch.autocast(self._device, self._torch_dtype):
            for i, t in tqdm(enumerate(self._scheduler.timesteps)):
                sigma = self._scheduler.sigmas[i]

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

                # compute the previous noisy sample x_t -> x_t-1
                latents = self._scheduler.step(
                    noise_pred, t, latents).prev_sample

                # call the callback
                if i % self._image_frequency == 0 or i == steps - 1:
                    image = latents_to_pil(latents_noiseless, self._vae)
                    callback(i + 1, image)

        # scale and decode the image latents with vae
        return latents_to_pil(latents, self._vae)
