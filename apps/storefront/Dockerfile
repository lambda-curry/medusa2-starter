FROM node:20-alpine AS base

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS builder

COPY . .

RUN npx --yes turbo@2.1.2 prune --scope=storefront --docker

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock yarn.lock
COPY --from=builder /app/.yarnrc.yml .yarnrc.yml
COPY --from=builder /app/.yarn .yarn

RUN yarn install

COPY --from=builder /app/out/full/ .

RUN yarn turbo build --filter=storefront && \
    yarn workspaces focus --all --production && \
    rm -rf node_modules/.cache .yarn/cache

FROM base AS runner

COPY --chown=node:node --from=installer /app/ .

USER 1000

WORKDIR /app/apps/storefront

ENV PORT=80

CMD ["yarn", "start"]