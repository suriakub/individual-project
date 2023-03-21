# Stable Diffusion powered image generation application

GitHub: https://github.com/suriakub/individual-project

#### System requirements

- RAM: 16GB
- GPU: 8GB VRAM

#### Prerequisites

- Node.js v18
- Python 3.8
- [CUDA 11.8](https://developer.nvidia.com/cuda-downloads)
- Docker

## How to run the setup locally (Docker Compose)

If you use a computer with an NVidia GPU, you can run the application locally using Docker compose.

To do this, navigate into the project's top-level directory (`/individual-project`) and run: 

`docker compose up -d`

Please ensure you have port `8080` free on localhost

When running for the first time, you need to wait some time for Docker to pull all the neede images and for the worker to download Stable Diffusion model weights from HuggingFace Hub.

## How to run the setup locally (for development)

If you want to contribute to the project, or just want to run the app on an M1 Macbook, you need to start
each component of the system separately.

The application consists of three separate repositories that need to be started manually.

1. Start the Redis instance: `cd stable-backend && docker compose up -d`
2. Start the worker - See the worker's [README.md](stable-backend/worker/README.md)
3. Start the API - See the API's [README.md](stable-backend/api/README.md)
4. Start the Frontend app - See the frontend's [README.md](stable-frontend/README.md)
