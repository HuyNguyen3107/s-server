import { Decimal } from '@prisma/client/runtime/library';

export class ProductCustom {
  id: string;
  productCategoryId: string;
  name: string;
  imageUrl: string;
  price?: Decimal;
  description?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductCustomWithRelations extends ProductCustom {
  productCategory: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
      collection: {
        id: string;
        name: string;
        imageUrl: string;
      };
    };
  };
  inventories: {
    id: string;
    currentStock?: number;
    reservedStock?: number;
    minStockAlert?: number;
    status?: string;
  }[];
}

export class PaginatedProductCustoms {
  data: ProductCustomWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
