from enum import Enum
import json

class WorkerResponseType(str, Enum):
    IMAGE_INFO = "IMAGE_INFO"
    PROGRESS = "PROGRESS"
    ERROR = "ERROR"

class Publisher:
    def __init__(self, r, channel):
        self._redis = r
        self._channel = channel

    def publish(self, message):
        msg = json.dumps(message)
        self._redis.publish(self._channel, msg)