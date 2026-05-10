# ===== Stage 1: build =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Stage 2: runner =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_DIR=/data/db

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 appuser \
 && mkdir -p /data/db \
 && chown appuser:nodejs /data/db

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

USER appuser
EXPOSE 3001
VOLUME ["/data/db"]

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health 2>/dev/null | grep -q '"status":"ok"' || exit 1

CMD ["node", "dist/index.js"]
