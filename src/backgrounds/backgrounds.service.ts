import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';
import { GetBackgroundsQueryDto } from './dto/get-backgrounds-query.dto';
import {
  BackgroundResponseDto,
  BackgroundListResponseDto,
} from './dto/background-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackgroundsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBackgroundDto: CreateBackgroundDto,
  ): Promise<BackgroundResponseDto> {
    try {
      // Kiểm tra product có tồn tại không
      const product = await this.prisma.product.findUnique({
        where: { id: createBackgroundDto.productId },
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với ID: ${createBackgroundDto.productId}`,
        );
      }

      const background = await this.prisma.background.create({
        data: {
          productId: createBackgroundDto.productId,
          name: createBackgroundDto.name,
          description: createBackgroundDto.description,
          imageUrl: createBackgroundDto.imageUrl,
          config: createBackgroundDto.config
            ? (JSON.parse(JSON.stringify(createBackgroundDto.config)) as any)
            : undefined,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return this.mapToResponseDto(background);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể tạo background mới');
    }
  }

  async findAll(
    query: GetBackgroundsQueryDto,
  ): Promise<BackgroundListResponseDto> {
    try {
      const { page = 1, limit = 10, search, productId } = query;
      const skip = (page - 1) * limit;

      // Build where condition
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            product: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        ];
      }

      if (productId) {
        where.productId = productId;
      }

      // Get total count
      const total = await this.prisma.background.count({ where });

      // Get backgrounds with pagination
      const backgrounds = await this.prisma.background.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: backgrounds.map((background) =>
          this.mapToResponseDto(background),
        ),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể lấy danh sách backgrounds',
      );
    }
  }

  async findOne(id: string): Promise<BackgroundResponseDto> {
    try {
      const background = await this.prisma.background.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!background) {
        throw new NotFoundException(`Không tìm thấy background với ID: ${id}`);
      }

      return this.mapToResponseDto(background);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể lấy thông tin background',
      );
    }
  }

  async update(
    id: string,
    updateBackgroundDto: UpdateBackgroundDto,
  ): Promise<BackgroundResponseDto> {
    try {
      // Kiểm tra background có tồn tại không
      const existingBackground = await this.prisma.background.findUnique({
        where: { id },
      });

      if (!existingBackground) {
        throw new NotFoundException(`Không tìm thấy background với ID: ${id}`);
      }

      // Nếu có productId mới, kiểm tra product có tồn tại không
      if (updateBackgroundDto.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: updateBackgroundDto.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Không tìm thấy sản phẩm với ID: ${updateBackgroundDto.productId}`,
          );
        }
      }

      // Build update data object
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updateBackgroundDto.productId) {
        updateData.productId = updateBackgroundDto.productId;
      }
      if (updateBackgroundDto.name !== undefined) {
        updateData.name = updateBackgroundDto.name;
      }
      if (updateBackgroundDto.description !== undefined) {
        updateData.description = updateBackgroundDto.description;
      }
      if (updateBackgroundDto.imageUrl) {
        updateData.imageUrl = updateBackgroundDto.imageUrl;
      }
      if (updateBackgroundDto.config !== undefined) {
        updateData.config = JSON.parse(
          JSON.stringify(updateBackgroundDto.config),
        );
      }

      // Update background
      const updatedBackground = await this.prisma.background.update({
        where: { id },
        data: updateData,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return this.mapToResponseDto(updatedBackground);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể cập nhật background');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Kiểm tra background có tồn tại không
      const existingBackground = await this.prisma.background.findUnique({
        where: { id },
      });

      if (!existingBackground) {
        throw new NotFoundException(`Không tìm thấy background với ID: ${id}`);
      }

      // Delete background
      await this.prisma.background.delete({
        where: { id },
      });

      return { message: 'Đã xóa background thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể xóa background');
    }
  }

  async findByProduct(productId: string): Promise<BackgroundResponseDto[]> {
    try {
      // Kiểm tra product có tồn tại không
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với ID: ${productId}`,
        );
      }

      const backgrounds = await this.prisma.background.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return backgrounds.map((background) => this.mapToResponseDto(background));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể lấy danh sách backgrounds theo sản phẩm',
      );
    }
  }

  private mapToResponseDto(background: any): BackgroundResponseDto {
    return {
      id: background.id,
      productId: background.productId,
      name: background.name,
      description: background.description,
      imageUrl: background.imageUrl,
      config: background.config,
      createdAt: background.createdAt,
      updatedAt: background.updatedAt,
      product: background.product
        ? {
            id: background.product.id,
            name: background.product.name,
            collection: background.product.collection,
          }
        : undefined,
    };
  }
}
