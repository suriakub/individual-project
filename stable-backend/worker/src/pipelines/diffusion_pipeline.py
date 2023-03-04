import os
from dotenv import load_dotenv
import torch

load_dotenv()

IMAGE_FREQUENCY: int = int(os.getenv('IMAGE_FREQUENCY'))


class DiffusionPipeline:
    def __init__(self, vae, text_encoder, tokenizer, unet, scheduler, device, torch_dtype) -> None:
        self._vae = vae
        self._text_encoder = text_encoder
        self._tokenizer = tokenizer
        self._unet = unet
        self._scheduler = scheduler
        self._device = device
        self._torch_dtype = torch_dtype
        self._image_frequency = IMAGE_FREQUENCY

    def _encode_prompt(self, prompt):
        text_input = self._tokenizer(
            prompt,
            padding="max_length",
            max_length=self._tokenizer.model_max_length,
            truncation=True,
            return_tensors="pt"
        )
        with torch.no_grad():
            text_embeddings = self._text_encoder(
                text_input.input_ids.to(self._device))[0]

        max_length = text_input.input_ids.shape[-1]
        uncond_input = self._tokenizer(
            [""], padding="max_length", max_length=max_length, return_tensors="pt"
        )

        with torch.no_grad():
            uncond_embeddings = self._text_encoder(
                uncond_input.input_ids.to(self._device))[0]

        return torch.cat([uncond_embeddings, text_embeddings])
