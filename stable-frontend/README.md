# Frontend application

#### Prerequisites
- Node.js v18

## How to run locally

1. Install packages: `npm install`
2. Create the `.env` file: `cp .env-example .env`
3. Start the app: `npm start`

The app will be accessible at [http://localhost:3002](http://localhost:3002) by default.

## How to build the Docker image

First, build the app: `npm run build:prod`

To build the docker image run: `docker build -t chooboo/stable-frontend .`

To deploy the image to Dockerhub run: `docker push chooboo/stable-frontend:latest`

## How to run the Docker image

`docker run -d -p 3000:3000 chooboo/stable-frontend`
