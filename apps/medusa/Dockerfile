FROM node:20-alpine AS base

RUN apk update

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

ENV PORT=80

CMD ["yarn", "start:prod"]