import time
import uuid
import random

class ImageGenerator:
    def __init__(self, publisher):
        self._publisher = publisher
    
    def text_to_image(self, prompt, height, width, steps, seed=None):
        filename = str(uuid.uuid4()) + ".png"
        time.sleep(random.randint(2, 7))

        message = {"filename": filename}
        self._publisher.publish(message)