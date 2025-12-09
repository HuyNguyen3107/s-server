export class ShippingFeeResponseDto {
  id: string;
  shippingType: string;
  area: string;
  estimatedDeliveryTime: string;
  shippingFee: number;
  notesOrRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedShippingFeesResponseDto {
  data: ShippingFeeResponseDto[];
  total: number;
  page: number;
  limit: number;
}
