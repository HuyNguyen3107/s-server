import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  GetProductCategoriesQueryDto,
} from './dto';
import {
  ProductCategory,
  ProductCategoryWithRelations,
  PaginatedProductCategories,
} from './entities';

@Injectable()
export class ProductCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategoryWithRelations> {
    const { productId, name } = createProductCategoryDto;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Kiểm tra tên thể loại đã tồn tại trong sản phẩm chưa
    const existingCategory = await this.prisma.productCategory.findFirst({
      where: {
        name,
        productId,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Tên thể loại đã tồn tại trong sản phẩm này');
    }

    const productCategory = await this.prisma.productCategory.create({
      data: {
        name,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true,
            collection: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        productCustoms: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
            description: true,
            status: true,
          },
        },
      },
    });

    return productCategory;
  }

  async findAll(
    query: GetProductCategoriesQueryDto,
  ): Promise<PaginatedProductCategories> {
    const {
      search,
      productId,
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

    if (productId) {
      where.productId = productId;
    }

    const [productCategories, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              collection: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          productCustoms: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              price: true,
              description: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.productCategory.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: productCategories,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<ProductCategoryWithRelations> {
    const productCategory = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true,
            collection: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        productCustoms: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!productCategory) {
      throw new NotFoundException('Thể loại sản phẩm không tồn tại');
    }

    return productCategory;
  }

  async update(
    id: string,
    updateProductCategoryDto: UpdateProductCategoryDto,
  ): Promise<ProductCategoryWithRelations> {
    const { name, productId } = updateProductCategoryDto;

    // Kiểm tra thể loại có tồn tại không
    const existingCategory = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Thể loại sản phẩm không tồn tại');
    }

    // Nếu cập nhật productId, kiểm tra sản phẩm có tồn tại không
    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }
    }

    // Kiểm tra tên thể loại đã tồn tại trong sản phẩm chưa (nếu cập nhật tên hoặc sản phẩm)
    if (name || productId) {
      const finalProductId = productId || existingCategory.productId;
      const finalName = name || existingCategory.name;

      const conflictCategory = await this.prisma.productCategory.findFirst({
        where: {
          name: finalName,
          productId: finalProductId,
          NOT: { id },
        },
      });

      if (conflictCategory) {
        throw new ConflictException(
          'Tên thể loại đã tồn tại trong sản phẩm này',
        );
      }
    }

    const productCategory = await this.prisma.productCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(productId && { productId }),
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true,
            collection: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        productCustoms: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
            description: true,
            status: true,
          },
        },
      },
    });

    return productCategory;
  }

  async remove(id: string): Promise<{ message: string }> {
    // Kiểm tra thể loại có tồn tại không
    const existingCategory = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productCustoms: true },
        },
      },
    });

    if (!existingCategory) {
      throw new NotFoundException('Thể loại sản phẩm không tồn tại');
    }

    // Kiểm tra có sản phẩm tùy chỉnh nào đang sử dụng không
    if (existingCategory._count.productCustoms > 0) {
      throw new BadRequestException(
        `Không thể xóa thể loại vì đang có ${existingCategory._count.productCustoms} sản phẩm tùy chỉnh`,
      );
    }

    await this.prisma.productCategory.delete({
      where: { id },
    });

    return { message: 'Xóa thể loại sản phẩm thành công' };
  }

  async findByProductId(
    productId: string,
  ): Promise<ProductCategoryWithRelations[]> {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const productCategories = await this.prisma.productCategory.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            status: true,
            collection: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        productCustoms: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
            description: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return productCategories;
  }

  async getStatistics(): Promise<{
    totalCategories: number;
    totalProductCustoms: number;
    categoriesByProduct: { productName: string; count: number }[];
    customsByCategory: { categoryName: string; count: number }[];
  }> {
    try {
      // Tổng số thể loại sản phẩm
      const totalCategories = await this.prisma.productCategory.count();

      // Tổng số sản phẩm tùy chỉnh
      const totalProductCustoms = await this.prisma.productCustom.count();

      // Thống kê thể loại theo sản phẩm
      const productStats = await this.prisma.productCategory.groupBy({
        by: ['productId'],
        _count: {
          productId: true,
        },
      });

      // Lấy tên của các sản phẩm
      const productNames = await this.prisma.product.findMany({
        where: {
          id: {
            in: productStats.map((stat) => stat.productId),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const categoriesByProduct = productStats.map((stat) => {
        const product = productNames.find((p) => p.id === stat.productId);
        return {
          productName: product?.name || 'Unknown',
          count: stat._count.productId,
        };
      });

      // Thống kê sản phẩm tùy chỉnh theo thể loại
      const categoryStats = await this.prisma.productCustom.groupBy({
        by: ['productCategoryId'],
        _count: {
          productCategoryId: true,
        },
      });

      // Lấy tên của các thể loại
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

      const customsByCategory = categoryStats.map((stat) => {
        const category = categoryNames.find(
          (c) => c.id === stat.productCategoryId,
        );
        return {
          categoryName: category?.name || 'Unknown',
          count: stat._count.productCategoryId,
        };
      });

      return {
        totalCategories,
        totalProductCustoms,
        categoriesByProduct,
        customsByCategory,
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy thống kê thể loại sản phẩm');
    }
  }
}
