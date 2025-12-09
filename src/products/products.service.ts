import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, GetProductsQueryDto } from './dto';
import { Product, ProductWithRelations, PaginatedProducts } from './entities';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductWithRelations> {
    const { collectionId, name, status, hasBg } = createProductDto;

    // Kiểm tra collection có tồn tại không
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Bộ sưu tập không tồn tại');
    }

    // Kiểm tra tên sản phẩm đã tồn tại trong collection chưa
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name,
        collectionId,
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        'Tên sản phẩm đã tồn tại trong bộ sưu tập này',
      );
    }

    const product = await this.prisma.product.create({
      data: {
        name,
        collectionId,
        status: status || 'active',
        hasBg,
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            routeName: true,
            isHot: true,
            status: true,
          },
        },
        productVariants: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            endow: true,
            option: true,
            config: true,
            status: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        backgrounds: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            config: true,
          },
        },
      },
    });

    return product;
  }

  async findAll(query: GetProductsQueryDto): Promise<PaginatedProducts> {
    const {
      search,
      collectionId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (collectionId) {
      where.collectionId = collectionId;
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          collection: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              routeName: true,
              isHot: true,
              status: true,
            },
          },
          productVariants: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              endow: true,
              option: true,
              config: true,
              status: true,
            },
          },
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
          backgrounds: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
              config: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<ProductWithRelations> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            routeName: true,
            isHot: true,
            status: true,
          },
        },
        productVariants: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            endow: true,
            option: true,
            config: true,
            status: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        backgrounds: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            config: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductWithRelations> {
    const { name, status, collectionId, hasBg } = updateProductDto;

    // Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Nếu cập nhật collectionId, kiểm tra collection có tồn tại không
    if (collectionId) {
      const collection = await this.prisma.collection.findUnique({
        where: { id: collectionId },
      });

      if (!collection) {
        throw new NotFoundException('Bộ sưu tập không tồn tại');
      }
    }

    // Kiểm tra tên sản phẩm đã tồn tại trong collection chưa (nếu cập nhật tên hoặc collection)
    if (name || collectionId) {
      const finalCollectionId = collectionId || existingProduct.collectionId;
      const finalName = name || existingProduct.name;

      const conflictProduct = await this.prisma.product.findFirst({
        where: {
          name: finalName,
          collectionId: finalCollectionId,
          NOT: { id },
        },
      });

      if (conflictProduct) {
        throw new ConflictException(
          'Tên sản phẩm đã tồn tại trong bộ sưu tập này',
        );
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(collectionId && { collectionId }),
        ...(hasBg !== undefined && { hasBg }),
        updatedAt: new Date(),
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            routeName: true,
            isHot: true,
            status: true,
          },
        },
        productVariants: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            endow: true,
            option: true,
            config: true,
            status: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        backgrounds: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            config: true,
          },
        },
      },
    });

    return product;
  }

  async remove(id: string): Promise<{ message: string }> {
    // Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productVariants: true },
        },
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Kiểm tra có variant nào đang sử dụng không
    if (existingProduct._count.productVariants > 0) {
      throw new BadRequestException(
        `Không thể xóa sản phẩm vì đang có ${existingProduct._count.productVariants} biến thể sản phẩm`,
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Xóa sản phẩm thành công' };
  }

  async findByCollectionId(
    collectionId: string,
  ): Promise<ProductWithRelations[]> {
    // Kiểm tra collection có tồn tại không
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Bộ sưu tập không tồn tại');
    }

    const products = await this.prisma.product.findMany({
      where: { collectionId },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            routeName: true,
            isHot: true,
            status: true,
          },
        },
        productVariants: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            endow: true,
            option: true,
            config: true,
            status: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        backgrounds: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            config: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<ProductWithRelations> {
    // Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            routeName: true,
            isHot: true,
            status: true,
          },
        },
        productVariants: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            endow: true,
            option: true,
            config: true,
            status: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        backgrounds: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            config: true,
          },
        },
      },
    });

    return product;
  }

  async getStatistics(): Promise<{
    totalProducts: number;
    totalProductVariants: number;
    productsByStatus: { status: string; count: number }[];
    productsByCollection: { collectionName: string; count: number }[];
  }> {
    try {
      // Tổng số sản phẩm
      const totalProducts = await this.prisma.product.count();

      // Tổng số biến thể sản phẩm
      const totalProductVariants = await this.prisma.productVariant.count();

      // Thống kê sản phẩm theo trạng thái
      const statusStats = await this.prisma.product.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const productsByStatus = statusStats.map((stat) => ({
        status: stat.status,
        count: stat._count.status,
      }));

      // Thống kê sản phẩm theo bộ sưu tập
      const collectionStats = await this.prisma.product.groupBy({
        by: ['collectionId'],
        _count: {
          collectionId: true,
        },
      });

      // Lấy tên của các bộ sưu tập
      const collectionNames = await this.prisma.collection.findMany({
        where: {
          id: {
            in: collectionStats.map((stat) => stat.collectionId),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const productsByCollection = collectionStats.map((stat) => {
        const collection = collectionNames.find(
          (c) => c.id === stat.collectionId,
        );
        return {
          collectionName: collection?.name || 'Unknown',
          count: stat._count.collectionId,
        };
      });

      return {
        totalProducts,
        totalProductVariants,
        productsByStatus,
        productsByCollection,
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy thống kê sản phẩm');
    }
  }
}
