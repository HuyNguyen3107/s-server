export class Background {
  id: string;
  productId: string;
  name?: string;
  description?: string;
  imageUrl: string;
  config?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class BackgroundWithRelations extends Background {
  product: {
    id: string;
    name: string;
    collection: {
      id: string;
      name: string;
    };
  };
}
