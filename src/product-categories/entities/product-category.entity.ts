import { Decimal } from '@prisma/client/runtime/library';

export interface ProductCategory {
  id: string;
  productId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategoryWithRelations extends ProductCategory {
  product: {
    id: string;
    name: string;
    status: string | null;
    collection: {
      id: string;
      name: string;
    } | null;
  };
  productCustoms: {
    id: string;
    name: string;
    imageUrl: string;
    price: Decimal | null;
    description: string | null;
    status: string | null;
  }[];
}

export interface PaginatedProductCategories {
  data: ProductCategoryWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
