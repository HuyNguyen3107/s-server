FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Cài đặt các dependencies cần thiết
RUN apk add --no-cache openssl

COPY package*.json ./
# Cài đặt tất cả dependencies vì cần ts-node cho seed
RUN npm ci && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY scripts ./scripts
COPY tsconfig.json ./

# Tạo prisma client trong runner stage
RUN npx prisma generate

EXPOSE 3001
CMD ["node", "scripts/start-prod.js"]

