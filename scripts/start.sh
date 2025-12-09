#!/bin/sh
set -e

echo "🚀 Starting application setup..."

# Chờ database sẵn sàng (quan trọng cho Railway)
echo "⏳ Waiting for database to be ready..."
sleep 5

# Chạy Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Chạy seed super admin
echo "👤 Seeding Super Admin..."
npx ts-node --transpile-only scripts/seed-super-admin.ts

# Start application
echo "✅ Starting NestJS application..."
exec node dist/src/main.js
