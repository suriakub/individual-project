from redis import Redis
import torch
import json
import time
from image_generator import ImageGenerator
from publisher import Publisher, WorkerResponseType
from enum import Enum
import traceback
from dotenv import load_dotenv
import os

load_dotenv()

PUBLISH_QUEUE = os.getenv('PUBLISH_QUEUE')
LISTEN_QUEUE = os.getenv('LISTEN_QUEUE')
MODEL = os.getenv('MODEL')
MODEL_PRECISION = torch.float16 if os.getenv(
    'USE_FLOAT16') == 'true' else torch.float32


class TaskType(str, Enum):
    IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE'
    TEXT_TO_IMAGE = 'TEXT_TO_IMAGE'
    IMAGE_INPAINTING = 'IMAGE_INPAINTING'


class Worker:
    def __init__(self):
        self._redis = Redis(
            host='localhost',
            port=6379,
            charset="utf-8",
            decode_responses=True
        )
        self._publisher = Publisher(
            r=self._redis,
            channel=PUBLISH_QUEUE
        )
        self._generator = ImageGenerator(
            publisher=self._publisher,
            model=MODEL,
            torch_dtype=MODEL_PRECISION
        )
        self._channel = LISTEN_QUEUE

    def _work(self, item):
        try:
            msg = json.loads(item)
            task_type = msg['taskType']
            username = msg['username']

            if (task_type == TaskType.TEXT_TO_IMAGE):
                print("Text-to-Image | prompt: " +
                      msg['args']['prompt'])
                self._generator.text_to_image(
                    username=username, **msg['args'])
                print("...finished")

            if (task_type == TaskType.IMAGE_TO_IMAGE):
                print("Image-to-Image | prompt: " +
                      msg['args']['prompt'])
                self._generator.image_to_image(
                    username=username, **msg['args'])
                print("...finished")

            if (task_type == TaskType.IMAGE_INPAINTING):
                print("Image inpainting | prompt: " +
                      msg['args']['prompt'])
                print("...finished")

        except Exception as e:
            self._publisher.publish(
                {"type": WorkerResponseType.ERROR, "error": str(e), "username": username})
            traceback.print_exc()
            print("ERROR: " + str(e))

    def run(self):
        print("Worker ready. Waiting for input...")
        while True:
            time.sleep(50 / 1000)  # 50ms
            item = self._redis.rpop(self._channel)
            if item is not None:
                self._work(item)


if __name__ == '__main__':
    Worker().run()
