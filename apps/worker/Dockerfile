FROM node:22-slim

WORKDIR /usr/src/topobre

RUN npm install -g pnpm

COPY --from=topobre-builder /topobre/package.json ./
COPY --from=topobre-builder /topobre/pnpm-lock.yaml ./
COPY --from=topobre-builder /topobre/pnpm-workspace.yaml ./
COPY --from=topobre-builder /topobre/apps/worker/package.json ./apps/worker/package.json

COPY --from=topobre-builder /topobre/apps/finloader/package.json ./apps/finloader/package.json
COPY --from=topobre-builder /topobre/packages/bullmq/package.json ./packages/bullmq/package.json
COPY --from=topobre-builder /topobre/packages/env/package.json ./packages/env/package.json
COPY --from=topobre-builder /topobre/packages/telemetry/package.json ./packages/telemetry/package.json
COPY --from=topobre-builder /topobre/packages/typeorm/package.json ./packages/typeorm/package.json
COPY --from=topobre-builder /topobre/packages/winston/package.json ./packages/winston/package.json
COPY --from=topobre-builder /topobre/packages/gemini/package.json ./packages/gemini/package.json

COPY --from=topobre-builder /topobre/apps/worker/dist ./apps/worker/dist
COPY --from=topobre-builder /topobre/apps/finloader/dist ./apps/finloader/dist
COPY --from=topobre-builder /topobre/packages/bullmq/dist ./packages/bullmq/dist
COPY --from=topobre-builder /topobre/packages/env/dist ./packages/env/dist
COPY --from=topobre-builder /topobre/packages/telemetry/dist ./packages/telemetry/dist
COPY --from=topobre-builder /topobre/packages/typeorm/dist ./packages/typeorm/dist
COPY --from=topobre-builder /topobre/packages/winston/dist ./packages/winston/dist
COPY --from=topobre-builder /topobre/packages/gemini/dist ./packages/gemini/dist

RUN pnpm install --prod --frozen-lockfile 
# COPY --from=topobre-builder /topobre/node_modules ./node_modules

COPY --from=topobre-builder /build/scripts/start.sh ./start.sh
RUN chmod +x ./start.sh
ENTRYPOINT ["./start.sh"]

CMD ["pnpm", "start:worker"]