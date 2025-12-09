import {
  ProductVariant as PrismaProductVariant,
  Product,
} from '@prisma/client';

export class ProductVariant implements PrismaProductVariant {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  price: any; // Decimal type from Prisma
  endow: any; // JSON
  option: any; // JSON
  config: any; // JSON
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantWithProduct extends ProductVariant {
  product: {
    id: string;
    name: string;
    collectionId: string;
    status: string | null;
    hasBg: boolean | null;
  };
}

export interface PaginatedProductVariants {
  data: ProductVariantWithProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
