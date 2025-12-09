import { PrismaClient } from '@prisma/client';
import {
  ALL_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  ADMIN_PERMISSIONS,
  STAFF_PERMISSIONS,
  VIEWER_PERMISSIONS,
} from '../src/permissions/constants/permissions.constants';

const prisma = new PrismaClient();

async function seedRolesAndPermissions() {
  console.log('🔄 Seeding roles and permissions...');

  // 1. Seed all permissions
  console.log(`📝 Seeding ${ALL_PERMISSIONS.length} permissions...`);

  const createdPermissions: { id: string; name: string }[] = [];
  for (const permissionName of ALL_PERMISSIONS) {
    try {
      const permission = await prisma.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: { name: permissionName },
      });
      createdPermissions.push(permission);
    } catch (error) {
      console.error(`❌ Error creating permission ${permissionName}:`, error);
    }
  }
  console.log(`✅ Created/Updated ${createdPermissions.length} permissions`);

  // 2. Define roles with their permissions
  const rolesData = [
    {
      name: 'Super Admin',
      isDeletable: false, // Không cho phép xóa
      permissions: SUPER_ADMIN_PERMISSIONS,
      description: 'Quyền cao nhất trong hệ thống, có tất cả các quyền',
    },
    {
      name: 'Admin',
      isDeletable: true,
      permissions: ADMIN_PERMISSIONS,
      description: 'Quản trị viên, có hầu hết các quyền trừ quyền hệ thống',
    },
    {
      name: 'Manager',
      isDeletable: true,
      permissions: [
        ...STAFF_PERMISSIONS,
        // Thêm một số quyền quản lý
        'users.create',
        'users.update',
        'products.manage',
        'collections.manage',
        'inventory.manage',
        'promotions.create',
        'promotions.update',
        'promotions.delete',
        'shipping-fees.create',
        'shipping-fees.update',
        'shipping-fees.delete',
        'reports.orders',
        'reports.inventory',
        'reports.export',
      ],
      description: 'Quản lý, có quyền quản lý sản phẩm, đơn hàng và nhân viên',
    },
    {
      name: 'Staff',
      isDeletable: true,
      permissions: STAFF_PERMISSIONS,
      description: 'Nhân viên, có quyền xử lý đơn hàng và quản lý cơ bản',
    },
    {
      name: 'Viewer',
      isDeletable: true,
      permissions: VIEWER_PERMISSIONS,
      description: 'Người xem, chỉ có quyền xem thông tin',
    },
  ];

  // 3. Create roles and assign permissions
  for (const roleData of rolesData) {
    try {
      console.log(`\n🔄 Processing role: ${roleData.name}`);

      // Create or update role
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: { isDeletable: roleData.isDeletable },
        create: {
          name: roleData.name,
          isDeletable: roleData.isDeletable,
        },
      });
      console.log(`  ✅ Role created/updated: ${role.name} (ID: ${role.id})`);

      // Delete existing permissions for this role
      const deletedCount = await prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      });
      console.log(`  🗑️ Deleted ${deletedCount.count} old role-permissions`);

      // Get permission IDs for this role
      const permissionsToAssign = createdPermissions.filter((p) =>
        roleData.permissions.includes(p.name),
      );

      if (permissionsToAssign.length > 0) {
        // Assign new permissions
        await prisma.rolePermission.createMany({
          data: permissionsToAssign.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
          })),
          skipDuplicates: true,
        });
        console.log(
          `  ✅ Assigned ${permissionsToAssign.length} permissions to ${roleData.name}`,
        );
      }
    } catch (error) {
      console.error(`❌ Error processing role ${roleData.name}:`, error);
    }
  }

  console.log('\n✅ Roles and permissions seeded successfully!');
}

async function main() {
  try {
    await seedRolesAndPermissions();
  } catch (error) {
    console.error('❌ Error in main:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedRolesAndPermissions };
