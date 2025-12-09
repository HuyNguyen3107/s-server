import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductCustomDto,
  UpdateProductCustomDto,
  GetProductCustomsQueryDto,
} from './dto';
import {
  ProductCustom,
  ProductCustomWithRelations,
  PaginatedProductCustoms,
} from './entities';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductCustomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductCustomDto: CreateProductCustomDto,
  ): Promise<ProductCustomWithRelations> {
    const { productCategoryId, name, imageUrl, price, description, status } =
      createProductCustomDto;

    // Kiểm tra product category có tồn tại không
    const productCategory = await this.prisma.productCategory.findUnique({
      where: { id: productCategoryId },
      include: {
        product: {
          include: {
            collection: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!productCategory) {
      throw new NotFoundException('Danh mục sản phẩm không tồn tại');
    }

    // Kiểm tra tên đã tồn tại trong category chưa
    const existingCustom = await this.prisma.productCustom.findFirst({
      where: {
        name,
        productCategoryId,
      },
    });

    if (existingCustom) {
      throw new ConflictException(
        'Tên tùy chỉnh sản phẩm đã tồn tại trong danh mục này',
      );
    }

    const productCustom = await this.prisma.productCustom.create({
      data: {
        productCategoryId,
        name,
        imageUrl,
        price: price ? new Decimal(price) : null,
        description,
        status: status || 'active',
      },
      include: {
        productCategory: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                collection: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        inventories: {
          select: {
            id: true,
            currentStock: true,
            reservedStock: true,
            minStockAlert: true,
            status: true,
          },
        },
      },
    });

    return productCustom;
  }

  async findAll(
    query: GetProductCustomsQueryDto,
  ): Promise<PaginatedProductCustoms> {
    const {
      search,
      productCategoryId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (productCategoryId) {
      where.productCategoryId = productCategoryId;
    }

    if (status) {
      where.status = status;
    }

    const [productCustoms, total] = await Promise.all([
      this.prisma.productCustom.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          productCategory: {
            select: {
              id: true,
              name: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  collection: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
          inventories: {
            select: {
              id: true,
              currentStock: true,
              reservedStock: true,
              minStockAlert: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.productCustom.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: productCustoms,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<ProductCustomWithRelations> {
    const productCustom = await this.prisma.productCustom.findUnique({
      where: { id },
      include: {
        productCategory: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                collection: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        inventories: {
          select: {
            id: true,
            currentStock: true,
            reservedStock: true,
            minStockAlert: true,
            status: true,
          },
        },
      },
    });

    if (!productCustom) {
      throw new NotFoundException('Tùy chỉnh sản phẩm không tồn tại');
    }

    return productCustom;
  }

  async update(
    id: string,
    updateProductCustomDto: UpdateProductCustomDto,
  ): Promise<ProductCustomWithRelations> {
    const { productCategoryId, name, imageUrl, price, description, status } =
      updateProductCustomDto;

    // Kiểm tra product custom có tồn tại không
    const existingProductCustom = await this.prisma.productCustom.findUnique({
      where: { id },
    });

    if (!existingProductCustom) {
      throw new NotFoundException('Tùy chỉnh sản phẩm không tồn tại');
    }

    // Nếu cập nhật productCategoryId, kiểm tra category có tồn tại không
    if (productCategoryId) {
      const productCategory = await this.prisma.productCategory.findUnique({
        where: { id: productCategoryId },
      });

      if (!productCategory) {
        throw new NotFoundException('Danh mục sản phẩm không tồn tại');
      }
    }

    // Kiểm tra tên đã tồn tại trong category chưa (nếu cập nhật tên hoặc category)
    if (name || productCategoryId) {
      const finalCategoryId =
        productCategoryId || existingProductCustom.productCategoryId;
      const finalName = name || existingProductCustom.name;

      const conflictCustom = await this.prisma.productCustom.findFirst({
        where: {
          name: finalName,
          productCategoryId: finalCategoryId,
          NOT: { id },
        },
      });

      if (conflictCustom) {
        throw new ConflictException(
          'Tên tùy chỉnh sản phẩm đã tồn tại trong danh mục này',
        );
      }
    }

    const productCustom = await this.prisma.productCustom.update({
      where: { id },
      data: {
        ...(productCategoryId && { productCategoryId }),
        ...(name && { name }),
        ...(imageUrl && { imageUrl }),
        ...(price !== undefined && {
          price: price ? new Decimal(price) : null,
        }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
      include: {
        productCategory: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                collection: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        inventories: {
          select: {
            id: true,
            currentStock: true,
            reservedStock: true,
            minStockAlert: true,
            status: true,
          },
        },
      },
    });

    return productCustom;
  }

  async remove(id: string): Promise<{ message: string }> {
    // Kiểm tra product custom có tồn tại không
    const existingProductCustom = await this.prisma.productCustom.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inventories: true },
        },
      },
    });

    if (!existingProductCustom) {
      throw new NotFoundException('Tùy chỉnh sản phẩm không tồn tại');
    }

    // Kiểm tra có inventory nào đang sử dụng không
    if (existingProductCustom._count.inventories > 0) {
      throw new BadRequestException(
        `Không thể xóa tùy chỉnh sản phẩm vì đang có ${existingProductCustom._count.inventories} bản ghi tồn kho`,
      );
    }

    await this.prisma.productCustom.delete({
      where: { id },
    });

    return { message: 'Xóa tùy chỉnh sản phẩm thành công' };
  }

  async findByProductCategoryId(
    productCategoryId: string,
  ): Promise<ProductCustomWithRelations[]> {
    // Kiểm tra product category có tồn tại không
    const productCategory = await this.prisma.productCategory.findUnique({
      where: { id: productCategoryId },
    });

    if (!productCategory) {
      throw new NotFoundException('Danh mục sản phẩm không tồn tại');
    }

    const productCustoms = await this.prisma.productCustom.findMany({
      where: { productCategoryId },
      include: {
        productCategory: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                collection: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        inventories: {
          select: {
            id: true,
            currentStock: true,
            reservedStock: true,
            minStockAlert: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return productCustoms;
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<ProductCustomWithRelations> {
    // Kiểm tra product custom có tồn tại không
    const existingProductCustom = await this.prisma.productCustom.findUnique({
      where: { id },
    });

    if (!existingProductCustom) {
      throw new NotFoundException('Tùy chỉnh sản phẩm không tồn tại');
    }

    const productCustom = await this.prisma.productCustom.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        productCategory: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                collection: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        inventories: {
          select: {
            id: true,
            currentStock: true,
            reservedStock: true,
            minStockAlert: true,
            status: true,
          },
        },
      },
    });

    return productCustom;
  }

  async getStatistics(): Promise<{
    totalProductCustoms: number;
    totalInventories: number;
    productCustomsByStatus: { status: string; count: number }[];
    productCustomsByCategory: { categoryName: string; count: number }[];
  }> {
    try {
      // Tổng số product customs
      const totalProductCustoms = await this.prisma.productCustom.count();

      // Tổng số inventories
      const totalInventories = await this.prisma.inventory.count();

      // Thống kê product customs theo trạng thái
      const statusStats = await this.prisma.productCustom.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const productCustomsByStatus = statusStats.map((stat) => ({
        status: stat.status || 'unknown',
        count: stat._count.status,
      }));

      // Thống kê product customs theo category
      const categoryStats = await this.prisma.productCustom.groupBy({
        by: ['productCategoryId'],
        _count: {
          productCategoryId: true,
        },
      });

      // Lấy tên của các categories
      const categoryNames = await this.prisma.productCategory.findMany({
        where: {
          id: {
            in: categoryStats.map((stat) => stat.productCategoryId),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const productCustomsByCategory = categoryStats.map((stat) => {
        const category = categoryNames.find(
          (c) => c.id === stat.productCategoryId,
        );
        return {
          categoryName: category?.name || 'Unknown',
          count: stat._count.productCategoryId,
        };
      });

      return {
        totalProductCustoms,
        totalInventories,
        productCustomsByStatus,
        productCustomsByCategory,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy thống kê tùy chỉnh sản phẩm',
      );
    }
  }
}
