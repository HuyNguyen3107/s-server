import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldPermissions() {
  try {
    // List of old format permissions to delete (with underscore)
    const oldPermissions = [
      'USER_CREATE',
      'USER_DELETE',
      'USER_LIST',
      'USER_READ',
      'USER_UPDATE',
      'ROLE_CREATE',
      'ROLE_DELETE',
      'ROLE_LIST',
      'ROLE_READ',
      'ROLE_UPDATE',
      'PERMISSION_CREATE',
      'PERMISSION_DELETE',
      'PERMISSION_LIST',
      'PERMISSION_READ',
      'PERMISSION_UPDATE',
      'PRODUCT_CREATE',
      'PRODUCT_DELETE',
      'PRODUCT_LIST',
      'PRODUCT_READ',
      'PRODUCT_UPDATE',
      'COLLECTION_CREATE',
      'COLLECTION_DELETE',
      'COLLECTION_LIST',
      'COLLECTION_READ',
      'COLLECTION_UPDATE',
      'ORDER_CREATE',
      'ORDER_DELETE',
      'ORDER_LIST',
      'ORDER_MANAGE',
      'ORDER_READ',
      'ORDER_UPDATE',
      'INVENTORY_MANAGE',
      'INVENTORY_READ',
      'INVENTORY_UPDATE',
      'FEEDBACK_DELETE',
      'FEEDBACK_LIST',
      'FEEDBACK_READ',
      'FEEDBACK_UPDATE',
      'PROMOTION_CREATE',
      'PROMOTION_DELETE',
      'PROMOTION_LIST',
      'PROMOTION_READ',
      'PROMOTION_UPDATE',
      'SYSTEM_ADMIN',
      'SYSTEM_CONFIG',
      'SYSTEM_REPORT',
      // Also delete old shipping.* (should be shipping-fees.*)
      'shipping.view',
      'shipping.create',
      'shipping.update',
      'shipping.delete',
    ];

    // Delete role_permissions records first
    const deletedRolePermissions = await prisma.rolePermission.deleteMany({
      where: {
        permission: {
          name: {
            in: oldPermissions,
          },
        },
      },
    });

    // Delete permissions
    const deletedPermissions = await prisma.permission.deleteMany({
      where: {
        name: {
          in: oldPermissions,
        },
      },
    });

    // Count remaining permissions
    const remainingCount = await prisma.permission.count();

    // List all remaining permissions
    const remainingPermissions = await prisma.permission.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
}

async function main() {
  await cleanupOldPermissions();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
