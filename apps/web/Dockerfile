FROM node:22-slim

WORKDIR /usr/src/topobre

RUN npm install -g pnpm

COPY --from=topobre-builder /topobre/package.json ./
COPY --from=topobre-builder /topobre/pnpm-lock.yaml ./
COPY --from=topobre-builder /topobre/pnpm-workspace.yaml ./
COPY --from=topobre-builder /topobre/apps/web/package.json ./apps/web/package.json

COPY --from=topobre-builder /topobre/apps/web/dist ./apps/web/dist

RUN pnpm install --prod --frozen-lockfile --filter=@topobre/web

CMD ["pnpm", "start:web"]