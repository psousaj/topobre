FROM node:22-slim

WORKDIR /usr/src/topobre

RUN npm install -g pnpm

COPY --from=topobre-builder /topobre/package.json ./
COPY --from=topobre-builder /topobre/pnpm-lock.yaml ./
COPY --from=topobre-builder /topobre/pnpm-workspace.yaml ./
COPY --from=topobre-builder /topobre/apps/api/package.json ./apps/api/package.json

COPY --from=topobre-builder /topobre/apps/api/dist ./apps/api/dist

RUN pnpm install --prod --frozen-lockfile --filter=@topobre/api

CMD ["pnpm", "start:api"]