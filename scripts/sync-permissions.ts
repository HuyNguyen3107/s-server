import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Danh sách TẤT CẢ quyền trong hệ thống
 * Được đồng bộ với file: src/permissions/constants/permissions.constants.ts
 */
const ALL_PERMISSIONS = [
  // ============================================
  // QUYỀN QUẢN LÝ NGƯỜI DÙNG
  // ============================================
  'users.view',
  'users.create',
  'users.update',
  'users.delete',
  'users.list',
  'users.manage',

  // ============================================
  // QUYỀN QUẢN LÝ VAI TRÒ
  // ============================================
  'roles.view',
  'roles.create',
  'roles.update',
  'roles.delete',
  'roles.list',
  'roles.manage',

  // ============================================
  // QUYỀN QUẢN LÝ QUYỀN HẠN
  // ============================================
  'permissions.view',
  'permissions.create',
  'permissions.update',
  'permissions.delete',
  'permissions.list',
  'permissions.manage',

  // ============================================
  // QUYỀN GÁN VAI TRÒ CHO NGƯỜI DÙNG
  // ============================================
  'user-roles.view',
  'user-roles.assign',
  'user-roles.revoke',
  'user-roles.manage',

  // ============================================
  // QUYỀN GÁN QUYỀN CHO VAI TRÒ
  // ============================================
  'role-permissions.view',
  'role-permissions.assign',
  'role-permissions.revoke',
  'role-permissions.manage',

  // ============================================
  // QUYỀN QUẢN LÝ BỘ SƯU TẬP
  // ============================================
  'collections.view',
  'collections.create',
  'collections.update',
  'collections.delete',
  'collections.manage',

  // ============================================
  // QUYỀN QUẢN LÝ SẢN PHẨM
  // ============================================
  'products.view',
  'products.create',
  'products.update',
  'products.delete',
  'products.manage',

  // ============================================
  // QUYỀN QUẢN LÝ BIẾN THỂ SẢN PHẨM
  // ============================================
  'product-variants.view',
  'product-variants.create',
  'product-variants.update',
  'product-variants.delete',
  'product-variants.manage',

  // ============================================
  // QUYỀN QUẢN LÝ DANH MỤC SẢN PHẨM
  // ============================================
  'product-categories.view',
  'product-categories.create',
  'product-categories.update',
  'product-categories.delete',
  'product-categories.manage',

  // ============================================
  // QUYỀN QUẢN LÝ SẢN PHẨM TÙY CHỈNH
  // ============================================
  'product-customs.view',
  'product-customs.create',
  'product-customs.update',
  'product-customs.delete',
  'product-customs.manage',

  // ============================================
  // QUYỀN QUẢN LÝ BACKGROUND
  // ============================================
  'backgrounds.view',
  'backgrounds.create',
  'backgrounds.update',
  'backgrounds.delete',
  'backgrounds.manage',

  // ============================================
  // QUYỀN QUẢN LÝ ĐƠN HÀNG
  // ============================================
  'orders.view',
  'orders.update',
  'orders.delete',
  'orders.list',
  'orders.manage',
  'orders.assign',
  'orders.update-status',
  'orders.transfer',

  // ============================================
  // QUYỀN QUẢN LÝ KHO HÀNG
  // ============================================
  'inventory.view',
  'inventory.create',
  'inventory.update',
  'inventory.delete',
  'inventory.list',
  'inventory.manage',
  'inventory.adjust',
  'inventory.reserve',
  'inventory.report',

  // ============================================
  // QUYỀN QUẢN LÝ KHUYẾN MÃI
  // ============================================
  'promotions.view',
  'promotions.create',
  'promotions.update',
  'promotions.delete',
  'promotions.list',
  'promotions.manage',

  // ============================================
  // QUYỀN QUẢN LÝ PHÍ VẬN CHUYỂN
  // ============================================
  'shipping-fees.view',
  'shipping-fees.create',
  'shipping-fees.update',
  'shipping-fees.delete',
  'shipping-fees.manage',

  // ============================================
  // QUYỀN QUẢN LÝ PHẢN HỒI
  // ============================================
  'feedbacks.view',
  'feedbacks.update',
  'feedbacks.delete',
  'feedbacks.manage',
  'feedbacks.respond',

  // ============================================
  // QUYỀN QUẢN LÝ TƯ VẤN
  // ============================================
  'consultations.view',
  'consultations.list',
  'consultations.update',
  'consultations.delete',
  'consultations.manage',

  // ============================================
  // QUYỀN QUẢN LÝ THÔNG TIN (PAGES)
  // ============================================
  'informations.view',
  'informations.create',
  'informations.update',
  'informations.delete',
  'informations.manage',

  // ============================================
  // QUYỀN QUẢN LÝ UPLOAD
  // ============================================
  'upload.create',
  'upload.delete',
  'upload.manage',
];

async function syncPermissions() {
  console.log('🔄 Bắt đầu đồng bộ permissions...');
  console.log(`📋 Tổng số quyền cần đồng bộ: ${ALL_PERMISSIONS.length}`);

  try {
    // Lấy danh sách permissions hiện tại
    const existingPermissions = await prisma.permission.findMany();
    const existingPermissionNames = new Set(existingPermissions.map((p) => p.name));
    const newPermissionNames = new Set(ALL_PERMISSIONS);

    // Tìm permissions cần xóa (có trong DB nhưng không có trong danh sách mới)
    const permissionsToDelete = existingPermissions.filter(
      (p) => !newPermissionNames.has(p.name),
    );

    // Tìm permissions cần thêm (có trong danh sách mới nhưng không có trong DB)
    const permissionsToAdd = ALL_PERMISSIONS.filter(
      (name) => !existingPermissionNames.has(name),
    );

    // Xóa permissions không còn sử dụng
    if (permissionsToDelete.length > 0) {
      console.log(`\n🗑️ Xóa ${permissionsToDelete.length} quyền cũ không sử dụng:`);
      
      for (const permission of permissionsToDelete) {
        // Xóa role_permissions liên quan trước
        await prisma.rolePermission.deleteMany({
          where: { permissionId: permission.id },
        });
        
        // Xóa permission
        await prisma.permission.delete({
          where: { id: permission.id },
        });
        
        console.log(`   - Đã xóa: ${permission.name}`);
      }
    } else {
      console.log('\n✅ Không có quyền cũ cần xóa');
    }

    // Thêm permissions mới
    if (permissionsToAdd.length > 0) {
      console.log(`\n📝 Thêm ${permissionsToAdd.length} quyền mới:`);
      
      for (const permissionName of permissionsToAdd) {
        await prisma.permission.create({
          data: { name: permissionName },
        });
        console.log(`   + Đã thêm: ${permissionName}`);
      }
    } else {
      console.log('\n✅ Không có quyền mới cần thêm');
    }

    // Cập nhật Super Admin role với tất cả permissions
    const superAdminRole = await prisma.role.findFirst({
      where: { name: 'Super Admin' },
    });

    if (superAdminRole) {
      console.log('\n👑 Cập nhật quyền cho Super Admin role...');
      
      // Lấy tất cả permissions hiện tại
      const allPermissions = await prisma.permission.findMany();
      
      // Xóa role permissions cũ của Super Admin
      await prisma.rolePermission.deleteMany({
        where: { roleId: superAdminRole.id },
      });
      
      // Gán tất cả permissions cho Super Admin
      await prisma.rolePermission.createMany({
        data: allPermissions.map((p) => ({
          roleId: superAdminRole.id,
          permissionId: p.id,
        })),
      });
      
      console.log(`✅ Super Admin đã được gán ${allPermissions.length} quyền`);
    }

    // Thống kê cuối cùng
    const finalCount = await prisma.permission.count();
    console.log(`\n📊 Thống kê:`);
    console.log(`   - Quyền đã xóa: ${permissionsToDelete.length}`);
    console.log(`   - Quyền đã thêm: ${permissionsToAdd.length}`);
    console.log(`   - Tổng quyền hiện tại: ${finalCount}`);
    console.log('\n🎉 Đồng bộ permissions hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ permissions:', error);
    throw error;
  }
}

async function main() {
  await syncPermissions();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

