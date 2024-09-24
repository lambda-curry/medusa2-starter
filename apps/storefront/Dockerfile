FROM node:20-alpine AS base

RUN apk update

RUN apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS builder

COPY . .

RUN npx --yes turbo@2.1.2 prune --scope=storefront && \
    cp -R .yarn .yarnrc.yml out/ && \
    cd out && \
    yarn install && \
    yarn turbo run build --filter=storefront && \
    yarn workspaces focus --all --production && \
    rm -rf node_modules/.cache .yarn/cache

FROM base AS runner

COPY --chown=node:node --from=builder /app/out .

USER 1000

WORKDIR /app/packages/storefront

ENV PORT=80

CMD ["yarn", "start"]