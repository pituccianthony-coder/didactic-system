FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/db/package.json ./packages/db/
COPY packages/auth/package.json ./packages/auth/
COPY packages/lib/package.json ./packages/lib/
RUN npm install
COPY . .
RUN npx turbo build --filter=web
FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
