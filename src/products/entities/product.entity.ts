import { Decimal } from '@prisma/client/runtime/library';

export interface Product {
  id: string;
  name: string;
  collectionId: string;
  status?: string;
  hasBg?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithCollection extends Product {
  collection: {
    id: string;
    name: string;
    imageUrl: string;
    routeName: string;
    isHot?: boolean;
    status?: string;
  };
}

export interface ProductWithVariants extends Product {
  productVariants: Array<{
    id: string;
    name: string;
    description?: string;
    price: Decimal;
    endow?: any;
    option?: any;
    config?: any;
    status?: string;
  }>;
}

export interface ProductWithRelations extends ProductWithCollection {
  productVariants: ProductWithVariants['productVariants'];
  categories?: Array<{
    id: string;
    name: string;
  }>;
  backgrounds?: Array<{
    id: string;
    name?: string;
    description?: string;
    imageUrl: string;
    config?: any;
  }>;
}

export interface PaginatedProducts {
  data: ProductWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
