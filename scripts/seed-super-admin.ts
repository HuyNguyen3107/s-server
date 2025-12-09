import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  try {
    // Đảm bảo role Super Admin tồn tại với isDeletable = false
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'Super Admin' },
      update: {
        isDeletable: false, // Không thể xóa
      },
      create: {
        name: 'Super Admin',
        isDeletable: false, // Không thể xóa
      },
    });

    // Tạo tất cả permissions và gán cho Super Admin (68 quyền)
    const permissions = [
      // User Management
      'users.view',
      'users.create',
      'users.update',
      'users.delete',

      // Role Management
      'roles.view',
      'roles.create',
      'roles.update',
      'roles.delete',

      // Permission Management
      'permissions.view',
      'permissions.create',
      'permissions.update',
      'permissions.delete',

      // User Roles Management
      'user-roles.view',
      'user-roles.create',
      'user-roles.delete',

      // Role Permissions Management
      'role-permissions.view',
      'role-permissions.create',
      'role-permissions.delete',

      // User Permissions Management
      'user-permissions.view',
      'user-permissions.create',
      'user-permissions.delete',

      // Product Management
      'products.view',
      'products.create',
      'products.update',
      'products.delete',

      // Product Categories Management
      'product-categories.view',
      'product-categories.create',
      'product-categories.update',
      'product-categories.delete',

      // Product Variants Management
      'product-variants.view',
      'product-variants.create',
      'product-variants.update',
      'product-variants.delete',

      // Product Customs Management
      'product-customs.view',
      'product-customs.create',
      'product-customs.update',
      'product-customs.delete',

      // Collection Management
      'collections.view',
      'collections.create',
      'collections.update',
      'collections.delete',

      // Order Management
      'orders.view',
      'orders.create',
      'orders.update',
      'orders.delete',

      // Inventory Management
      'inventory.view',
      'inventory.update',

      // Feedback Management
      'feedbacks.view',
      'feedbacks.create',
      'feedbacks.update',
      'feedbacks.delete',

      // Promotion Management
      'promotions.view',
      'promotions.create',
      'promotions.update',
      'promotions.delete',

      // Shipping Fees Management
      'shipping-fees.view',
      'shipping-fees.create',
      'shipping-fees.update',
      'shipping-fees.delete',

      // Report Management
      'reports.view',
      'reports.create',

      // System Settings
      'settings.view',
      'settings.update',

      // Background Management
      'backgrounds.view',
      'backgrounds.create',
      'backgrounds.update',
      'backgrounds.delete',

      // Consultation Management
      'consultations.view',
      'consultations.create',
      'consultations.update',
      'consultations.delete',

      // Notification Management
      'notifications.view',
      'notifications.create',
      'notifications.update',
      'notifications.delete',

      // Upload Management
      'upload.files',
    ];

    // Tạo tất cả permissions
    const createdPermissions = [];
    for (const permissionName of permissions) {
      const permission = await prisma.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: { name: permissionName },
      });
      createdPermissions.push(permission);
    }

    // Xóa các permissions cũ của Super Admin role
    await prisma.rolePermission.deleteMany({
      where: { roleId: superAdminRole.id },
    });

    // Gán tất cả permissions cho Super Admin role
    await prisma.rolePermission.createMany({
      data: createdPermissions.map((permission) => ({
        roleId: superAdminRole.id,
        permissionId: permission.id,
      })),
    });

    // Hash mật khẩu mặc định
    const defaultPassword = 'SuperAdmin@2024';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Tạo tài khoản Super Admin với isDeletable = false
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@soligant.com' },
      update: {
        passwordHash,
        isActive: true,
        isDeletable: false, // Không thể xóa
      },
      create: {
        email: 'superadmin@soligant.com',
        passwordHash,
        name: 'Super Administrator',
        phone: '0999999999',
        isActive: true,
        isDeletable: false, // Không thể xóa
      },
    });

    // Gán Super Admin role cho user
    await prisma.userRole.upsert({
      where: {
        idx_user_roles_unique: {
          userId: superAdmin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo Super Admin:', error);
    throw error;
  }
}

async function main() {
  await seedSuperAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
