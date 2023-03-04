import torch
import base64
import uuid
from PIL import Image
from io import BytesIO


def latents_to_pil(latents, vae):
    latents = 1 / 0.18215 * latents
    with torch.no_grad():
        image = vae.decode(latents).sample
    image = (image / 2 + 0.5).clamp(0, 1)
    image = image.cpu().permute(0, 2, 3, 1).float().numpy()

    if image.ndim == 3:
        image = image[None, ...]
    image = (image * 255).round().astype("uint8")
    return Image.fromarray(image[0])


# assumes image is encoded as base64 string
def pil_from_string(image: str):
    image = bytes(image, 'utf-8')
    image = image[image.find(b'/9'):]
    image = Image.open(
        BytesIO(base64.b64decode(image))).convert("RGB")
    return image


def string_from_pil(image):
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    image_str = base64.b64encode(buffer.getvalue())
    return 'data:image/jpeg;base64,' + "".join(map(chr, image_str))


def generate_image_name(prompt: str):
    return prompt.strip().replace(" ", "-") + "-" + str(uuid.uuid4())[:6] + '.jpg'
