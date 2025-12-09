import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS } from '../constants/permissions.constants';

const prisma = new PrismaClient();

async function seedPermissions() {
  try {
    console.log('🔄 Seeding permissions...');
    console.log(`📝 Total permissions to seed: ${ALL_PERMISSIONS.length}`);

    // Lấy danh sách permissions hiện có
    const existingPermissions = await prisma.permission.findMany({
      select: { name: true },
    });
    const existingNames = new Set(existingPermissions.map((p) => p.name));

    // Tìm permissions cần thêm mới
    const newPermissions = ALL_PERMISSIONS.filter(
      (name) => !existingNames.has(name),
    );

    if (newPermissions.length > 0) {
      // Tạo các permissions mới
      const result = await prisma.permission.createMany({
        data: newPermissions.map((name) => ({ name })),
        skipDuplicates: true,
      });
      console.log(`✅ Created ${result.count} new permissions`);
    } else {
      console.log('ℹ️ All permissions already exist');
    }

    // Tìm permissions cần xóa (không còn trong ALL_PERMISSIONS)
    const permissionsToDelete = existingPermissions
      .filter((p) => !ALL_PERMISSIONS.includes(p.name))
      .map((p) => p.name);

    if (permissionsToDelete.length > 0) {
      console.log(
        `🗑️ Found ${permissionsToDelete.length} obsolete permissions`,
      );
      // Không tự động xóa để tránh mất dữ liệu, chỉ log cảnh báo
      console.log('⚠️ Obsolete permissions:', permissionsToDelete);
      console.log('⚠️ Run cleanup script manually if you want to remove them');
    }

    // Lấy danh sách permissions cuối cùng
    const permissions = await prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });

    console.log(`✅ Total permissions in database: ${permissions.length}`);
    return permissions;
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
}

export { seedPermissions };
