#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { seedPermissions } from '../src/permissions/seeds/permissions.seed';

const prisma = new PrismaClient();

async function main() {
  try {
    await seedPermissions();
  } catch (error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
