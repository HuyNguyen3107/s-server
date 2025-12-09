import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { GetFeedbacksQueryDto } from './dto/get-feedbacks-query.dto';
import {
  FeedbackResponseDto,
  FeedbackListResponseDto,
} from './dto/feedback-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbacksService {
  constructor(private prisma: PrismaService) {}

  async create(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    try {
      const feedback = await this.prisma.feedback.create({
        data: {
          customerName: createFeedbackDto.customerName,
          content: createFeedbackDto.content,
          imageUrl: createFeedbackDto.imageUrl,
          rating: createFeedbackDto.rating,
        },
      });

      return this.mapToResponseDto(feedback);
    } catch (error) {
      throw new InternalServerErrorException('Không thể tạo feedback mới');
    }
  }

  async findAll(query: GetFeedbacksQueryDto): Promise<FeedbackListResponseDto> {
    try {
      const { page = 1, limit = 10, search, rating } = query;
      const skip = (page - 1) * limit;

      // Build where condition
      const where: any = {};

      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (rating) {
        where.rating = rating;
      }

      // Get total count
      const total = await this.prisma.feedback.count({ where });

      // Get feedbacks with pagination
      const feedbacks = await this.prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: feedbacks.map((feedback) => this.mapToResponseDto(feedback)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể lấy danh sách feedbacks',
      );
    }
  }

  async findOne(id: string): Promise<FeedbackResponseDto> {
    try {
      const feedback = await this.prisma.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        throw new NotFoundException(`Không tìm thấy feedback với ID: ${id}`);
      }

      return this.mapToResponseDto(feedback);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể lấy thông tin feedback',
      );
    }
  }

  async update(
    id: string,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    try {
      // Check if feedback exists
      const existingFeedback = await this.prisma.feedback.findUnique({
        where: { id },
      });

      if (!existingFeedback) {
        throw new NotFoundException(`Không tìm thấy feedback với ID: ${id}`);
      }

      // Update feedback
      const updatedFeedback = await this.prisma.feedback.update({
        where: { id },
        data: {
          ...(updateFeedbackDto.customerName && {
            customerName: updateFeedbackDto.customerName,
          }),
          ...(updateFeedbackDto.content && {
            content: updateFeedbackDto.content,
          }),
          ...(updateFeedbackDto.imageUrl && {
            imageUrl: updateFeedbackDto.imageUrl,
          }),
          ...(updateFeedbackDto.rating && { rating: updateFeedbackDto.rating }),
          updatedAt: new Date(),
        },
      });

      return this.mapToResponseDto(updatedFeedback);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể cập nhật feedback');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Check if feedback exists
      const existingFeedback = await this.prisma.feedback.findUnique({
        where: { id },
      });

      if (!existingFeedback) {
        throw new NotFoundException(`Không tìm thấy feedback với ID: ${id}`);
      }

      // Delete feedback
      await this.prisma.feedback.delete({
        where: { id },
      });

      return { message: 'Đã xóa feedback thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể xóa feedback');
    }
  }

  async getStatistics(): Promise<{
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    try {
      const totalFeedbacks = await this.prisma.feedback.count();

      const ratingStats = await this.prisma.feedback.groupBy({
        by: ['rating'],
        _count: {
          rating: true,
        },
        _avg: {
          rating: true,
        },
      });

      const averageRating = await this.prisma.feedback.aggregate({
        _avg: {
          rating: true,
        },
      });

      const ratingDistribution = ratingStats.map((stat) => ({
        rating: stat.rating,
        count: stat._count.rating,
      }));

      return {
        totalFeedbacks,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể lấy thống kê feedbacks',
      );
    }
  }

  private mapToResponseDto(feedback: any): FeedbackResponseDto {
    return {
      id: feedback.id,
      customerName: feedback.customerName,
      content: feedback.content,
      imageUrl: feedback.imageUrl,
      rating: feedback.rating,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    };
  }
}
