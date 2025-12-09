import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateShippingFeeDto } from './dto/create-shipping-fee.dto';
import { UpdateShippingFeeDto } from './dto/update-shipping-fee.dto';
import { FilterShippingFeeDto } from './dto/filter-shipping-fee.dto';
import {
  ShippingFeeResponseDto,
  PaginatedShippingFeesResponseDto,
} from './dto/shipping-fee-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ShippingFee } from '@prisma/client';

@Injectable()
export class ShippingFeesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createShippingFeeDto: CreateShippingFeeDto,
  ): Promise<{ data: ShippingFeeResponseDto; isUpdated: boolean }> {
    // Kiểm tra xem đã có phí ship cho loại vận chuyển và khu vực này chưa
    const existingShippingFee = await this.prisma.shippingFee.findFirst({
      where: {
        shippingType: createShippingFeeDto.shippingType,
        area: createShippingFeeDto.area,
      },
    });

    if (existingShippingFee) {
      // Cập nhật record hiện có thay vì throw error
      const updatedShippingFee = await this.prisma.shippingFee.update({
        where: { id: existingShippingFee.id },
        data: {
          estimatedDeliveryTime: createShippingFeeDto.estimatedDeliveryTime,
          shippingFee: createShippingFeeDto.shippingFee,
          notesOrRemarks: createShippingFeeDto.notesOrRemarks,
          updatedAt: new Date(),
        },
      });

      return {
        data: this.mapToResponseDto(updatedShippingFee),
        isUpdated: true,
      };
    }

    const shippingFee = await this.prisma.shippingFee.create({
      data: {
        shippingType: createShippingFeeDto.shippingType,
        area: createShippingFeeDto.area,
        estimatedDeliveryTime: createShippingFeeDto.estimatedDeliveryTime,
        shippingFee: createShippingFeeDto.shippingFee,
        notesOrRemarks: createShippingFeeDto.notesOrRemarks,
      },
    });

    return {
      data: this.mapToResponseDto(shippingFee),
      isUpdated: false,
    };
  }

  async findAll(
    filterDto: FilterShippingFeeDto,
  ): Promise<PaginatedShippingFeesResponseDto> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    // Ensure page and limit are numbers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (filterDto.shippingType) {
      where.shippingType = {
        contains: filterDto.shippingType,
        mode: 'insensitive',
      };
    }
    if (filterDto.area) {
      where.area = {
        contains: filterDto.area,
        mode: 'insensitive',
      };
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      this.prisma.shippingFee.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
      }),
      this.prisma.shippingFee.count({ where }),
    ]);

    return {
      data: data.map((item) => this.mapToResponseDto(item)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<ShippingFeeResponseDto> {
    const shippingFee = await this.prisma.shippingFee.findUnique({
      where: { id },
    });

    if (!shippingFee) {
      throw new NotFoundException('Không tìm thấy thông tin phí ship');
    }

    return this.mapToResponseDto(shippingFee);
  }

  async findByAreaAndType(
    area: string,
    shippingType: string,
  ): Promise<ShippingFeeResponseDto[]> {
    const shippingFees = await this.prisma.shippingFee.findMany({
      where: {
        area: {
          contains: area,
          mode: 'insensitive',
        },
        shippingType: {
          contains: shippingType,
          mode: 'insensitive',
        },
      },
      orderBy: { shippingFee: 'asc' },
    });

    return shippingFees.map((item) => this.mapToResponseDto(item));
  }

  async update(
    id: string,
    updateShippingFeeDto: UpdateShippingFeeDto,
  ): Promise<ShippingFeeResponseDto> {
    const existingShippingFee = await this.findOne(id);

    // Kiểm tra trùng lặp nếu có cập nhật shippingType hoặc area
    if (updateShippingFeeDto.shippingType || updateShippingFeeDto.area) {
      const duplicateShippingFee = await this.prisma.shippingFee.findFirst({
        where: {
          shippingType:
            updateShippingFeeDto.shippingType ||
            existingShippingFee.shippingType,
          area: updateShippingFeeDto.area || existingShippingFee.area,
          id: { not: id },
        },
      });

      if (duplicateShippingFee) {
        throw new ConflictException(
          'Đã tồn tại phí ship cho loại vận chuyển và khu vực này',
        );
      }
    }

    const updatedShippingFee = await this.prisma.shippingFee.update({
      where: { id },
      data: updateShippingFeeDto,
    });

    return this.mapToResponseDto(updatedShippingFee);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id); // Kiểm tra tồn tại

    await this.prisma.shippingFee.delete({
      where: { id },
    });

    return { message: 'Đã xóa thông tin phí ship thành công' };
  }

  async getShippingFeesByArea(area: string): Promise<ShippingFeeResponseDto[]> {
    const shippingFees = await this.prisma.shippingFee.findMany({
      where: {
        area: {
          contains: area,
          mode: 'insensitive',
        },
      },
      orderBy: { shippingFee: 'asc' },
    });

    return shippingFees.map((item) => this.mapToResponseDto(item));
  }

  async getDistinctAreas(): Promise<string[]> {
    const areas = await this.prisma.shippingFee.findMany({
      select: { area: true },
      distinct: ['area'],
      orderBy: { area: 'asc' },
    });

    return areas.map((item) => item.area);
  }

  async getDistinctShippingTypes(): Promise<string[]> {
    const types = await this.prisma.shippingFee.findMany({
      select: { shippingType: true },
      distinct: ['shippingType'],
      orderBy: { shippingType: 'asc' },
    });

    return types.map((item) => item.shippingType);
  }

  async getStatistics(): Promise<{
    totalShippingFees: number;
    totalAreas: number;
    totalShippingTypes: number;
    averageShippingFee: number;
    minShippingFee: number;
    maxShippingFee: number;
  }> {
    const totalShippingFees = await this.prisma.shippingFee.count();

    const distinctAreas = await this.prisma.shippingFee.findMany({
      select: { area: true },
      distinct: ['area'],
    });
    const totalAreas = distinctAreas.length;

    const distinctTypes = await this.prisma.shippingFee.findMany({
      select: { shippingType: true },
      distinct: ['shippingType'],
    });
    const totalShippingTypes = distinctTypes.length;

    const stats = await this.prisma.shippingFee.aggregate({
      _avg: { shippingFee: true },
      _min: { shippingFee: true },
      _max: { shippingFee: true },
    });

    return {
      totalShippingFees,
      totalAreas,
      totalShippingTypes,
      averageShippingFee: stats._avg.shippingFee?.toNumber() || 0,
      minShippingFee: stats._min.shippingFee?.toNumber() || 0,
      maxShippingFee: stats._max.shippingFee?.toNumber() || 0,
    };
  }

  private mapToResponseDto(shippingFee: ShippingFee): ShippingFeeResponseDto {
    return {
      id: shippingFee.id,
      shippingType: shippingFee.shippingType,
      area: shippingFee.area,
      estimatedDeliveryTime: shippingFee.estimatedDeliveryTime,
      shippingFee: shippingFee.shippingFee.toNumber(),
      notesOrRemarks: shippingFee.notesOrRemarks,
      createdAt: shippingFee.createdAt,
      updatedAt: shippingFee.updatedAt,
    };
  }
}
