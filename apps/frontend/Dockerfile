
FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json

RUN pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend

ARG API_URL=http://backend:3001
ARG NEXT_PUBLIC_API_URL=http://localhost

ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app/apps/frontend

RUN pnpm build

FROM node:20-bookworm-slim AS runner

WORKDIR /app/apps/frontend

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/package.json ./package.json
COPY --from=builder /app/apps/frontend/next.config.mjs ./next.config.mjs
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/frontend/node_modules ./node_modules

EXPOSE 3000

CMD ["node_modules/.bin/next", "start", "-p", "3000"]
