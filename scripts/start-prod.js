/**
 * Production startup script
 * - Chạy Prisma migrations
 * - Seed Super Admin
 * - Start NestJS application
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function runCommand(command, description) {
  log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} - Hoàn thành!`);
    return true;
  } catch (error) {
    log(`❌ ${description} - Lỗi: ${error.message}`);
    return false;
  }
}

async function main() {
  log('🚀 Bắt đầu khởi động ứng dụng...');

  // Chờ database sẵn sàng (quan trọng cho Railway)
  log('⏳ Chờ database sẵn sàng...');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Chạy Prisma migrations
  if (!runCommand('npx prisma migrate deploy', 'Chạy database migrations')) {
    log('⚠️ Migrations có thể đã được áp dụng hoặc có lỗi. Tiếp tục...');
  }

  // Seed Super Admin
  log('👤 Tạo Super Admin...');
  try {
    // Sử dụng ts-node để chạy seed script
    execSync('npx ts-node --transpile-only scripts/seed-super-admin.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env },
    });
    log('✅ Super Admin đã được tạo/cập nhật!');
  } catch (error) {
    log(`⚠️ Lỗi khi tạo Super Admin: ${error.message}`);
    log('⚠️ Tiếp tục khởi động ứng dụng...');
  }

  // Start NestJS application
  log('🌟 Khởi động NestJS application...');
  const app = spawn('node', ['dist/src/main.js'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env },
  });

  app.on('error', (error) => {
    log(`❌ Lỗi khởi động ứng dụng: ${error.message}`);
    process.exit(1);
  });

  app.on('exit', (code) => {
    log(`📭 Ứng dụng đã dừng với code: ${code}`);
    process.exit(code || 0);
  });
}

main().catch((error) => {
  log(`❌ Lỗi không xác định: ${error.message}`);
  process.exit(1);
});
