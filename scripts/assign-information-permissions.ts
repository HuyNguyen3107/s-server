#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignInformationPermissions() {
  try {
    console.log('🔍 Finding Super Admin role...');

    // Tìm Super Admin role
    const superAdminRole = await prisma.role.findFirst({
      where: {
        name: {
          in: ['Super Admin', 'SUPER_ADMIN', 'super_admin'],
        },
      },
    });

    if (!superAdminRole) {
      console.log('❌ Super Admin role not found');
      console.log('Creating Super Admin role...');

      const newRole = await prisma.role.create({
        data: {
          name: 'Super Admin',
          isDeletable: false,
        },
      });

      console.log('✅ Super Admin role created:', newRole.id);
      return assignPermissionsToRole(newRole.id);
    }

    console.log('✅ Found Super Admin role:', superAdminRole.id);
    return assignPermissionsToRole(superAdminRole.id);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function assignPermissionsToRole(roleId: string) {
  console.log('🔍 Finding INFORMATION permissions...');

  const informationPermissions = await prisma.permission.findMany({
    where: {
      name: {
        startsWith: 'INFORMATION_',
      },
    },
  });

  if (informationPermissions.length === 0) {
    console.log('❌ No INFORMATION permissions found');
    console.log('Please run: npm run seed:permissions');
    return;
  }

  console.log(
    `✅ Found ${informationPermissions.length} INFORMATION permissions`,
  );

  // Sử dụng createMany với skipDuplicates để tránh lỗi
  const rolePermissions = informationPermissions.map((permission) => ({
    roleId: roleId,
    permissionId: permission.id,
  }));

  try {
    const result = await prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });

    console.log(`✅ Assigned ${result.count} new permissions`);

    informationPermissions.forEach((permission) => {
      console.log(`  - ${permission.name}`);
    });

    console.log('✨ All INFORMATION permissions assigned successfully!');
  } catch (error) {
    console.error('❌ Error assigning permissions:', error);
    throw error;
  }
}

assignInformationPermissions();
