# REST API 

#### Prerequisites
- Node.js v18
- Redis running locally on port 6379 - you can run `docker-compose up -d` when in the 
`/stable-backend` directory.

## How to run the application locally

1. Install pnpm:  `npm i -g pnpm`
2. Create the `.env` file: `cp .env-example .env`
3. Install packages: `pnpm i`
4. Build the app: `pnpm build`
5. Run the app: `pnpm start`

The server will now listen on port `8082`.

## How to run tests

`pnpm test`

## How to build the Docker image

To build the docker image run: `docker build -t chooboo/stable-backend-api .`

To deploy the image to Dockerhub run: `docker push chooboo/stable-backend-api:latest`

## How to run the Docker image

`docker run -d -p 8082:8082 chooboo/stable-backend-api`
