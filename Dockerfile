FROM node:18-buster-slim

RUN npm i -g pnpm

COPY . /app
WORKDIR /app

RUN pnpm install
RUN pnpm build
