export class CollectionResponseDto {
  id: string;
  name: string;
  imageUrl: string;
  routeName: string;
  isHot?: boolean;
  status?: string;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
