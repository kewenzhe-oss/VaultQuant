# Stage 1: Base & Dependencies
FROM node:20-slim AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Build Next.js application & Drizzle migrations
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run db:generate || true
RUN npm run build

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built standalone app, static assets & native node_modules
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create directory for persistent SQLite database
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
ENV DATABASE_URL="file:/app/data/local.db"

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
