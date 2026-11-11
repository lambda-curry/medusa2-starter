FROM node:26-alpine AS base

RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g corepack && corepack enable && corepack prepare yarn@4.18.1 --activate

WORKDIR /app

FROM base AS builder

COPY . .

RUN npx --yes turbo@2.11.10 prune --scope=medusa --docker

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock yarn.lock
COPY --from=builder /app/.yarnrc.yml .yarnrc.yml
COPY --from=builder /app/.yarn .yarn

RUN yarn install

COPY --from=builder /app/out/full/ .

COPY --from=builder /app/scripts/docker-workspace-packages.mjs scripts/docker-workspace-packages.mjs

RUN yarn turbo build --filter=medusa && \
    node scripts/docker-workspace-packages.mjs pack /app/packs && \
    rm -rf node_modules/.cache .yarn/cache


FROM base AS runner

COPY --chown=node:node --from=installer /app/yarn.lock .
COPY --chown=node:node --from=installer /app/.yarnrc.yml .yarnrc.yml
COPY --chown=node:node --from=installer /app/.yarn .yarn
COPY --chown=node:node --from=installer /app/apps/medusa/.medusa/server /app/server
COPY --chown=node:node --from=installer /app/yarn.lock /app/server/yarn.lock

COPY --from=installer /app/packs /app/packs
COPY --from=installer /app/scripts/docker-workspace-packages.mjs /app/scripts/docker-workspace-packages.mjs

# The app's workspace dependencies install from the tarballs packed above; see the script for why.
RUN node /app/scripts/docker-workspace-packages.mjs use /app/packs /app/server/package.json && \
    cd /app/server && YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn workspaces focus --production

USER 1000

WORKDIR /app/server

ENV PORT=80

CMD ["yarn", "start:prod"]
