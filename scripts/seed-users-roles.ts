import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUserAndRoles() {
  try {
    // Create some roles first
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
      },
    });

    const managerRole = await prisma.role.upsert({
      where: { name: 'manager' },
      update: {},
      create: {
        name: 'manager',
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: {
        name: 'user',
      },
    });

    // Hash password for users
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@soligant.com' },
      update: {},
      create: {
        email: 'admin@soligant.com',
        passwordHash,
        name: 'System Administrator',
        phone: '0123456789',
        isActive: true,
      },
    });

    // Create manager user
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@soligant.com' },
      update: {},
      create: {
        email: 'manager@soligant.com',
        passwordHash,
        name: 'System Manager',
        phone: '0987654321',
        isActive: true,
      },
    });

    // Create regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@soligant.com' },
      update: {},
      create: {
        email: 'user@soligant.com',
        passwordHash,
        name: 'Regular User',
        phone: '0111222333',
        isActive: true,
      },
    });

    // Assign roles to users
    // Admin gets admin role
    await prisma.userRole.upsert({
      where: {
        idx_user_roles_unique: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    // Manager gets manager and user roles
    await prisma.userRole.upsert({
      where: {
        idx_user_roles_unique: {
          userId: managerUser.id,
          roleId: managerRole.id,
        },
      },
      update: {},
      create: {
        userId: managerUser.id,
        roleId: managerRole.id,
      },
    });

    await prisma.userRole.upsert({
      where: {
        idx_user_roles_unique: {
          userId: managerUser.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: managerUser.id,
        roleId: userRole.id,
      },
    });

    // Regular user gets user role
    await prisma.userRole.upsert({
      where: {
        idx_user_roles_unique: {
          userId: regularUser.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: regularUser.id,
        roleId: userRole.id,
      },
    });
  } catch (error) {
    throw error;
  }
}

async function main() {
  await seedUserAndRoles();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
