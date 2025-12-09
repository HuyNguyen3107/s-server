export class OrderResponseDto {
  id: string;
  userId: string;
  status: string;
  information: any;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name: string;
    phone: string;
  };
}

export class PaginatedOrderResponseDto {
  orders: OrderResponseDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class ApiResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
