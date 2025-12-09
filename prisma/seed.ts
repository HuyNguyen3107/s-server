import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed user
  const email = process.env.SEED_USER_EMAIL || 'test@example.com';
  const password = process.env.SEED_USER_PASSWORD || 'Password123!';

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Seed User',
        phone: '0123456789',
      },
    });
  } else {
  }

  // Seed collections
  const collectionsData = [
    {
      name: 'Bộ sưu tập Mùa Hè',
      imageUrl:
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500',
      routeName: 'bo-suu-tap-mua-he',
      isHot: true,
      status: 'active',
    },
    {
      name: 'Bộ sưu tập Vintage',
      imageUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      routeName: 'bo-suu-tap-vintage',
      isHot: false,
      status: 'active',
    },
    {
      name: 'Bộ sưu tập Hiện Đại',
      imageUrl:
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500',
      routeName: 'bo-suu-tap-hien-dai',
      isHot: true,
      status: 'active',
    },
    {
      name: 'Bộ sưu tập Mùa Đông',
      imageUrl:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
      routeName: 'bo-suu-tap-mua-dong',
      isHot: false,
      status: 'inactive',
    },
    {
      name: 'Bộ sưu tập Thể Thao',
      imageUrl:
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500',
      routeName: 'bo-suu-tap-the-thao',
      isHot: false,
      status: 'active',
    },
  ];

  for (const collectionData of collectionsData) {
    const existing = await prisma.collection.findFirst({
      where: { routeName: collectionData.routeName },
    });

    if (!existing) {
      const collection = await prisma.collection.create({
        data: collectionData,
      });
    } else {
    }
  }

  // Seed some products for each collection
  const collections = await prisma.collection.findMany();
  for (const collection of collections) {
    const productCount = await prisma.product.count({
      where: { collectionId: collection.id },
    });

    if (productCount === 0) {
      // Create 2-5 products for each collection
      const numProducts = Math.floor(Math.random() * 4) + 2;
      for (let i = 1; i <= numProducts; i++) {
        await prisma.product.create({
          data: {
            name: `Sản phẩm ${i} - ${collection.name}`,
            collectionId: collection.id,
            status: 'active',
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
