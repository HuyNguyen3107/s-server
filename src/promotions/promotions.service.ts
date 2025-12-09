import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreatePromotionDto, PromotionType } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  ValidatePromotionDto,
  PromotionValidationResult,
} from './dto/validate-promotion.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Promotion } from '@prisma/client';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    // Kiểm tra mã giảm giá đã tồn tại chưa
    const existingPromotion = await this.prisma.promotion.findFirst({
      where: { promoCode: createPromotionDto.promoCode },
    });

    if (existingPromotion) {
      throw new ConflictException('Mã giảm giá đã tồn tại');
    }

    // Validate logic
    if (
      createPromotionDto.type === PromotionType.PERCENTAGE &&
      createPromotionDto.value > 100
    ) {
      throw new BadRequestException(
        'Giá trị phần trăm giảm giá không được vượt quá 100%',
      );
    }

    if (
      createPromotionDto.endDate &&
      new Date(createPromotionDto.endDate) <=
        new Date(createPromotionDto.startDate)
    ) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    return this.prisma.promotion.create({
      data: {
        ...createPromotionDto,
        minOrderValue: createPromotionDto.minOrderValue ?? 0,
        maxDiscountAmount: createPromotionDto.maxDiscountAmount ?? null,
        startDate: new Date(createPromotionDto.startDate),
        endDate: createPromotionDto.endDate
          ? new Date(createPromotionDto.endDate)
          : null,
        usageCount: 0,
        isActive: createPromotionDto.isActive ?? true,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    isActive?: boolean,
  ): Promise<{
    data: Promotion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where = isActive !== undefined ? { isActive } : {};

    const [data, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('Không tìm thấy mã giảm giá');
    }

    return promotion;
  }

  async findByPromoCode(promoCode: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findFirst({
      where: { promoCode: promoCode.toUpperCase() },
    });

    if (!promotion) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    return promotion;
  }

  async update(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const existingPromotion = await this.findOne(id);

    // Kiểm tra mã giảm giá trùng (nếu có cập nhật promoCode)
    if (
      updatePromotionDto.promoCode &&
      updatePromotionDto.promoCode !== existingPromotion.promoCode
    ) {
      const duplicatePromotion = await this.prisma.promotion.findFirst({
        where: {
          promoCode: updatePromotionDto.promoCode,
          id: { not: id },
        },
      });

      if (duplicatePromotion) {
        throw new ConflictException('Mã giảm giá đã tồn tại');
      }
    }

    // Validate logic
    if (
      updatePromotionDto.type === PromotionType.PERCENTAGE &&
      updatePromotionDto.value > 100
    ) {
      throw new BadRequestException(
        'Giá trị phần trăm giảm giá không được vượt quá 100%',
      );
    }

    if (updatePromotionDto.endDate && updatePromotionDto.startDate) {
      if (
        new Date(updatePromotionDto.endDate) <=
        new Date(updatePromotionDto.startDate)
      ) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
      }
    }

    const updateData: any = { ...updatePromotionDto };
    if (updatePromotionDto.startDate) {
      updateData.startDate = new Date(updatePromotionDto.startDate);
    }
    if (updatePromotionDto.endDate) {
      updateData.endDate = new Date(updatePromotionDto.endDate);
    }
    if (updatePromotionDto.minOrderValue !== undefined) {
      updateData.minOrderValue = updatePromotionDto.minOrderValue ?? 0;
    }
    if (updatePromotionDto.maxDiscountAmount !== undefined) {
      updateData.maxDiscountAmount =
        updatePromotionDto.maxDiscountAmount ?? null;
    }

    return this.prisma.promotion.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id); // Kiểm tra tồn tại

    await this.prisma.promotion.delete({
      where: { id },
    });

    return { message: 'Đã xóa mã giảm giá thành công' };
  }

  async validatePromotion(
    validateDto: ValidatePromotionDto,
  ): Promise<PromotionValidationResult> {
    try {
      const promotion = await this.findByPromoCode(validateDto.promoCode);
      const now = new Date();

      // Kiểm tra trạng thái active
      if (!promotion.isActive) {
        return {
          isValid: false,
          error: 'Mã giảm giá không còn hiệu lực',
        };
      }

      // Kiểm tra thời gian
      if (promotion.startDate > now) {
        return {
          isValid: false,
          error: 'Mã giảm giá chưa có hiệu lực',
        };
      }

      if (promotion.endDate && promotion.endDate < now) {
        return {
          isValid: false,
          error: 'Mã giảm giá đã hết hạn',
        };
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (validateDto.orderValue < promotion.minOrderValue.toNumber()) {
        return {
          isValid: false,
          error: `Đơn hàng phải có giá trị tối thiểu ${promotion.minOrderValue.toNumber().toLocaleString('vi-VN')} VND`,
        };
      }

      // Kiểm tra số lần sử dụng
      if (
        promotion.usageLimit &&
        promotion.usageCount >= promotion.usageLimit
      ) {
        return {
          isValid: false,
          error: 'Mã giảm giá đã hết lượt sử dụng',
        };
      }

      // Tính toán số tiền giảm
      let discountAmount = 0;
      if (promotion.type === PromotionType.PERCENTAGE) {
        discountAmount =
          (validateDto.orderValue * promotion.value.toNumber()) / 100;
      } else {
        discountAmount = promotion.value.toNumber();
      }

      // Áp dụng giới hạn giảm tối đa nếu có
      if (
        promotion.maxDiscountAmount &&
        discountAmount > promotion.maxDiscountAmount.toNumber()
      ) {
        discountAmount = promotion.maxDiscountAmount.toNumber();
      }

      return {
        isValid: true,
        promotion,
        discountAmount,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message || 'Mã giảm giá không hợp lệ',
      };
    }
  }

  async applyPromotion(promoCode: string): Promise<Promotion> {
    const promotion = await this.findByPromoCode(promoCode);

    // Tăng usage count
    return this.prisma.promotion.update({
      where: { id: promotion.id },
      data: {
        usageCount: promotion.usageCount + 1,
      },
    });
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();

    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStatistics(): Promise<{
    totalPromotions: number;
    activePromotions: number;
    expiredPromotions: number;
    totalUsage: number;
    averageDiscount: number;
  }> {
    const now = new Date();

    // Count total promotions
    const totalPromotions = await this.prisma.promotion.count();

    // Count active promotions (current and future valid ones)
    const activePromotions = await this.prisma.promotion.count({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    });

    // Count expired promotions
    const expiredPromotions = await this.prisma.promotion.count({
      where: {
        OR: [{ isActive: false }, { endDate: { lt: now } }],
      },
    });

    // Calculate total usage
    const usageStats = await this.prisma.promotion.aggregate({
      _sum: {
        usageCount: true,
      },
    });

    const totalUsage = usageStats._sum.usageCount || 0;

    // Calculate average discount (simplified - could be more sophisticated)
    const discountStats = await this.prisma.promotion.aggregate({
      _avg: {
        value: true,
      },
    });

    const averageDiscount = discountStats._avg.value?.toNumber() || 0;

    return {
      totalPromotions,
      activePromotions,
      expiredPromotions,
      totalUsage,
      averageDiscount,
    };
  }
}
