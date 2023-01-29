from redis import Redis
import json
import time
from imagegenerator import ImageGenerator
from publisher import Publisher, WorkerResponseType
from enum import Enum
import traceback

PUBLISH_QUEUE = "workerMessages"
LISTEN_QUEUE = "workerTasks"


class TaskType(str, Enum):
    IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE'
    TEXT_TO_IMAGE = 'TEXT_TO_IMAGE'
    IMAGE_INPAINTING = 'IMAGE_INPAINTING'


class Worker:
    def __init__(self):
        self._redis = Redis(charset="utf-8", decode_responses=True)
        self._publisher = Publisher(self._redis, PUBLISH_QUEUE)
        self._generator = ImageGenerator(self._publisher)
        self._channel = LISTEN_QUEUE

    def _work(self, item):
        try:
            msg = json.loads(item)
            task_type = msg['taskType']

            if (task_type == TaskType.TEXT_TO_IMAGE):
                print("Text-to-Image | prompt: " +
                      msg['args']['prompt'])
                self._generator.text_to_image(
                    user_id=msg['userId'], **msg['args'])
                print("...finished")

            if (task_type == TaskType.IMAGE_TO_IMAGE):
                print("Image-to-Image | prompt: " +
                      msg['args']['prompt'])
                self._generator.image_to_image(
                    user_id=msg['userId'], **msg['args'])
                print("...finished")

            if (task_type == TaskType.IMAGE_INPAINTING):
                print("Image inpainting | prompt: " +
                      msg['args']['prompt'])
                print("...finished")

        except ValueError as e:
            self._publisher.publish(
                {"type": WorkerResponseType.ERROR, "error": str(e)})
            print("Error decoding message: " + str(e))
            
        except Exception as e:
            self._publisher.publish(
                {"type": WorkerResponseType.ERROR, "error": str(e)})
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
