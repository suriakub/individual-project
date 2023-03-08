# Stable Diffusion powered image generation application

#### System requirements

- RAM: 16GB
- GPU: 8GB VRAM

#### Prerequisites

- Node.js v18
- Python 3.8
- [CUDA 11.8](https://developer.nvidia.com/cuda-downloads)
- Docker

## How to run the setup locally (Docker)

You can run the application's top-level docker-compose file

Please ensure you have port `8080` free on localhost

Then you can run when in the project's top-level directory (`/individual-project`)

`docker compose up -d`

When running for the first time, you need to wait a while until the worker downloads
the required models.

## How to run the setup locally (for development)

The application consists of three separate repositories that need to be started manually.

1. Start the Redis instance: `cd stable-backend && docker compose up -d`
2. Start the worker - See the worker's [README.md](stable-backend/worker/README.md)
3. Start the API - See the API's [README.md](stable-backend/api/README.md)
4. Start the Frontend app - See the frontend's [README.md](stable-frontend/README.md)
