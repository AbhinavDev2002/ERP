FROM node:22.17-alpine AS base

RUN apk add --no-cache openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

FROM base AS build

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/test-utils/package.json packages/test-utils/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store && \
  pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @erp/api build && \
  pnpm --filter @erp/api deploy --prod --legacy /out && \
  cp -r apps/api/dist /out/dist && \
  mkdir -p /out/prisma && \
  cp -r apps/api/prisma/. /out/prisma/ && \
  cd /out && \
  DATABASE_URL=postgres://erp:erp@localhost:5432/erp \
  node /repo/apps/api/node_modules/prisma/build/index.js generate --schema=./prisma/schema.prisma

FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

RUN addgroup -S erp && adduser -S erp -G erp
COPY --from=build --chown=erp:erp /out ./

USER erp

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]
