FROM pytorch/pytorch:latest

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ .

CMD ["python", "worker.py"]
