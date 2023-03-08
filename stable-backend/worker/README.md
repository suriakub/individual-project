# Image generator (worker)

#### System requirements
- RAM: 16GB
- GPU: 8GB VRAM

#### Prerequisites

- [CUDA 11.8](https://developer.nvidia.com/cuda-downloads)
- Python 3.8
- Redis running locally on port 6379 - you can run `docker-compose up -d` when in the 
`/stable-backend` directory.

## How to run locally

1. Create a Python virtual environment: `python3 -m venv .venv`
2. Activate the virtual environment: `source .venv/bin/activate`
3. [Install PyTorch](https://pytorch.org/) (Package: pip & Compute Platform: CUDA)
4. Install packages: `pip install -r requirements.txt`
2. Create the `.env` file: `cp .env-example .env`
5. Run the worker: `python src/worker.py`

## How to build the Docker image

To build the docker image run: `docker build -t chooboo/stable-backend-worker .`

To deploy the image to Dockerhub run: `docker push chooboo/stable-backend-worker:latest`

## How to run the Docker image

`docker run --rm --gpus all -it chooboo/stable-backend-worker`
