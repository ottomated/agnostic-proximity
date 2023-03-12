FROM node:18-buster-slim AS builder
ARG app

WORKDIR /app
RUN npm i -g pnpm turbo

COPY . .
RUN turbo prune --scope=$app --docker

FROM node:18-buster-slim AS installer
ARG app

WORKDIR /app
RUN npm i -g pnpm

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm i
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=$app...

FROM node:18-buster-slim AS runner
ARG app
WORKDIR /app
RUN npm i -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 runner
USER runner

COPY --from=installer --chown=runner:nodejs /app ./

ENV APP $app
CMD pnpm start:${APP}