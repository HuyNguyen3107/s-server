export class ProductResponseDto {
  id: string;
  name: string;
  collectionId: string;
  status?: string;
  hasBg?: boolean;
  createdAt: Date;
  updatedAt: Date;

  collection?: {
    id: string;
    name: string;
    imageUrl: string;
    routeName: string;
  };

  productVariants?: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    status?: string;
  }>;
}
