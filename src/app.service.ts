import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getPublicStatistics() {
    try {
      // Get basic counts without sensitive data
      const [totalProducts, totalFeedbacks, totalPromotions, averageRating] =
        await Promise.all([
          this.prisma.product.count(),
          this.prisma.feedback.count(),
          this.prisma.promotion.count(),
          this.prisma.feedback.aggregate({
            _avg: { rating: true },
          }),
        ]);

      return {
        products: {
          total: totalProducts,
        },
        feedbacks: {
          total: totalFeedbacks,
          averageRating: averageRating._avg.rating || 0,
        },
        promotions: {
          total: totalPromotions,
        },
        // We don't expose user counts for privacy
        users: {
          total: 0, // Hidden for security
        },
      };
    } catch (error) {
      return {
        products: { total: 0 },
        feedbacks: { total: 0, averageRating: 0 },
        promotions: { total: 0 },
        users: { total: 0 },
      };
    }
  }
}
