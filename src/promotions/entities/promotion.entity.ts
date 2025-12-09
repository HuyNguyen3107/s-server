import { Promotion as PrismaPromotion } from '@prisma/client';

export class Promotion implements PrismaPromotion {
  id: string;
  title: string;
  description: string;
  type: string;
  value: any; // Prisma Decimal
  minOrderValue: any; // Prisma Decimal
  maxDiscountAmount: any; // Prisma Decimal
  startDate: Date;
  endDate: Date | null;
  usageLimit: number | null;
  usageCount: number | null;
  isActive: boolean | null;
  promoCode: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Promotion>) {
    Object.assign(this, partial);
  }
}
