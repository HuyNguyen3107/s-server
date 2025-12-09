export class Inventory {
  id: string;
  productCustomId: string;
  currentStock: number;
  reservedStock: number;
  minStockAlert: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  productCustom?: any;
}
