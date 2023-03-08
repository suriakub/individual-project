FROM node:18.14.2-slim

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY dist/ . 

CMD ["node", "index.js"]
