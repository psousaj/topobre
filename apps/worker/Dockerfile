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

COPY --from=topobre-builder /topobre/apps/worker/dist/bundle ./apps/worker/dist/bundle
COPY --from=topobre-builder /topobre/apps/finloader/dist ./apps/finloader/dist
COPY --from=topobre-builder /topobre/packages/bullmq/dist/bundle/index.js ./packages/bullmq/dist/bundle/index.js
COPY --from=topobre-builder /topobre/packages/env/dist/bundle/index.js ./packages/env/dist/bundle/index.js
COPY --from=topobre-builder /topobre/packages/telemetry/dist/bundle/index.js ./packages/telemetry/dist/bundle/index.js
COPY --from=topobre-builder /topobre/packages/typeorm/dist/bundle/index.js ./packages/typeorm/dist/bundle/index.js
COPY --from=topobre-builder /topobre/packages/winston/dist/bundle/index.js ./packages/winston/dist/bundle/index.js
COPY --from=topobre-builder /topobre/packages/gemini/dist/bundle/index.js ./packages/gemini/dist/bundle/index.js

RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --prod --frozen-lockfile

CMD ["pnpm", "start:worker"]