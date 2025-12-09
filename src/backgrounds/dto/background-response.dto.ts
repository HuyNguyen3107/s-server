export class BackgroundResponseDto {
  id: string;
  productId: string;
  name?: string;
  description?: string;
  imageUrl: string;
  config?: any;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    name: string;
    collection: {
      id: string;
      name: string;
    };
  };
}

export class BackgroundListResponseDto {
  data: BackgroundResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
