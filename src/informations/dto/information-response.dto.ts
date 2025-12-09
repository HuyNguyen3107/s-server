export class InformationResponseDto {
  id: string;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class InformationListResponseDto {
  data: InformationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
