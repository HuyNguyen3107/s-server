import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCollectionDto: CreateCollectionDto,
  ): Promise<CollectionResponseDto> {
    try {
      // Kiểm tra tên bộ sưu tập đã tồn tại
      const existingCollection = await this.prisma.collection.findFirst({
        where: {
          OR: [
            { name: createCollectionDto.name },
            { routeName: createCollectionDto.routeName },
          ],
        },
      });

      if (existingCollection) {
        throw new ConflictException(
          'Tên bộ sưu tập hoặc route name đã tồn tại',
        );
      }

      const collection = await this.prisma.collection.create({
        data: {
          ...createCollectionDto,
          status: createCollectionDto.status || 'active',
        },
      });

      return collection;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Tên bộ sưu tập hoặc route name đã tồn tại',
          );
        }
      }
      throw new BadRequestException('Không thể tạo bộ sưu tập');
    }
  }

  async findAll(): Promise<CollectionResponseDto[]> {
    const collections = await this.prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return collections.map((collection) => ({
      ...collection,
      productCount: collection._count.products,
    }));
  }

  async findOne(id: string): Promise<CollectionResponseDto> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Không tìm thấy bộ sưu tập với ID ${id}`);
    }

    return {
      ...collection,
      productCount: collection._count.products,
    };
  }

  async findByRouteName(routeName: string): Promise<CollectionResponseDto> {
    const collection = await this.prisma.collection.findFirst({
      where: { routeName },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(
        `Không tìm thấy bộ sưu tập với route name ${routeName}`,
      );
    }

    return {
      ...collection,
      productCount: collection._count.products,
    };
  }

  async findHotCollections(): Promise<CollectionResponseDto[]> {
    const collections = await this.prisma.collection.findMany({
      where: {
        isHot: true,
        status: 'active',
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return collections.map((collection) => ({
      ...collection,
      productCount: collection._count.products,
    }));
  }

  async update(
    id: string,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    try {
      // Kiểm tra bộ sưu tập có tồn tại
      const existingCollection = await this.findOne(id);

      // Kiểm tra tên hoặc route name trùng lặp (nếu được cập nhật)
      const { name, routeName } = updateCollectionDto;
      if (name || routeName) {
        const duplicateCollection = await this.prisma.collection.findFirst({
          where: {
            AND: [
              { id: { not: id } }, // Không phải chính nó
              {
                OR: [name ? { name } : {}, routeName ? { routeName } : {}],
              },
            ],
          },
        });

        if (duplicateCollection) {
          throw new ConflictException(
            'Tên bộ sưu tập hoặc route name đã tồn tại',
          );
        }
      }

      const updatedCollection = await this.prisma.collection.update({
        where: { id },
        data: {
          ...updateCollectionDto,
          updatedAt: new Date(),
        },
      });

      return updatedCollection;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Tên bộ sưu tập hoặc route name đã tồn tại',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Không tìm thấy bộ sưu tập với ID ${id}`);
        }
      }
      throw new BadRequestException('Không thể cập nhật bộ sưu tập');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Kiểm tra bộ sưu tập có tồn tại
      await this.findOne(id);

      // Kiểm tra có sản phẩm nào đang sử dụng collection này không
      const productsCount = await this.prisma.product.count({
        where: { collectionId: id },
      });

      if (productsCount > 0) {
        throw new ConflictException(
          `Không thể xóa bộ sưu tập vì đang có ${productsCount} sản phẩm sử dụng`,
        );
      }

      await this.prisma.collection.delete({
        where: { id },
      });

      return { message: 'Xóa bộ sưu tập thành công' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Không tìm thấy bộ sưu tập với ID ${id}`);
        }
      }
      throw new BadRequestException('Không thể xóa bộ sưu tập');
    }
  }

  async toggleStatus(id: string): Promise<CollectionResponseDto> {
    const collection = await this.findOne(id);

    const newStatus = collection.status === 'active' ? 'inactive' : 'active';

    return this.update(id, { status: newStatus });
  }
}
