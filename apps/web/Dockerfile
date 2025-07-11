FROM node:22-slim

WORKDIR /usr/src/topobre

RUN npm install -g pnpm

COPY --from=topobre-builder /topobre/package.json ./
COPY --from=topobre-builder /topobre/pnpm-lock.yaml ./
COPY --from=topobre-builder /topobre/pnpm-workspace.yaml ./
COPY --from=topobre-builder /topobre/apps/web/package.json ./apps/web/package.json

# COPY --from=topobre-builder /topobre/apps/web/dist ./apps/web/dist
# COPY --from=topobre-builder /topobre/apps/api/dist ./apps/api/dist
# COPY --from=topobre-builder /topobre/packages/bullmq/dist ./packages/bullmq/dist
# COPY --from=topobre-builder /topobre/packages/env/dist ./packages/env/dist
# COPY --from=topobre-builder /topobre/packages/telemetry/dist ./packages/telemetry/dist
# COPY --from=topobre-builder /topobre/packages/typeorm/dist ./packages/typeorm/dist
# COPY --from=topobre-builder /topobre/packages/winston/dist ./packages/winston/dist


RUN pnpm install --prod --frozen-lockfile --filter=@topobre/web

CMD ["pnpm", "start:web"]