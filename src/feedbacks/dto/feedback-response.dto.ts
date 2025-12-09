export class FeedbackResponseDto {
  id: string;
  customerName: string;
  content: string;
  imageUrl: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FeedbackListResponseDto {
  data: FeedbackResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
