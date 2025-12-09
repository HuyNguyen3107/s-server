import { ShippingFee as PrismaShippingFee } from '@prisma/client';

export class ShippingFee implements PrismaShippingFee {
  id: string;
  shippingType: string;
  area: string;
  estimatedDeliveryTime: string;
  shippingFee: any; // Prisma Decimal type
  notesOrRemarks: string | null;
  createdAt: Date;
  updatedAt: Date;
}
