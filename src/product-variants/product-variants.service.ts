import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  GetProductVariantsQueryDto,
} from './dto';
import {
  ProductVariantWithProduct,
  PaginatedProductVariants,
} from './entities';

@Injectable()
export class ProductVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariantWithProduct> {
    const {
      productId,
      name,
      description,
      price,
      endow,
      option,
      config,
      status,
    } = createProductVariantDto;

    // Kiểm tra product có tồn tại không
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Kiểm tra tên variant đã tồn tại trong product chưa
    const existingVariant = await this.prisma.productVariant.findFirst({
      where: {
        name,
        productId,
      },
    });

    if (existingVariant) {
      throw new ConflictException('Tên biến thể đã tồn tại trong sản phẩm này');
    }

    const productVariant = await this.prisma.productVariant.create({
      data: {
        productId,
        name,
        description,
        price,
        endow,
        option,
        config,
        status: status || 'active',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            collectionId: true,
            status: true,
            hasBg: true,
          },
        },
      },
    });

    return productVariant;
  }

  async findAll(
    query: GetProductVariantsQueryDto,
  ): Promise<PaginatedProductVariants> {
    const {
      search,
      productId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
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

    if (productId) {
      where.productId = productId;
    }

    if (status) {
      where.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const [productVariants, total] = await Promise.all([
      this.prisma.productVariant.findMany({
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
              collectionId: true,
              status: true,
              hasBg: true,
            },
          },
        },
      }),
      this.prisma.productVariant.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: productVariants,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<ProductVariantWithProduct> {
    const productVariant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            collectionId: true,
            status: true,
            hasBg: true,
          },
        },
      },
    });

    if (!productVariant) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    return productVariant;
  }

  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariantWithProduct> {
    const { name, description, price, endow, option, config, status } =
      updateProductVariantDto;

    // Kiểm tra variant có tồn tại không
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    // Kiểm tra tên variant đã tồn tại trong product chưa (nếu cập nhật tên)
    if (name && name !== existingVariant.name) {
      const conflictVariant = await this.prisma.productVariant.findFirst({
        where: {
          name,
          productId: existingVariant.productId,
          NOT: { id },
        },
      });

      if (conflictVariant) {
        throw new ConflictException(
          'Tên biến thể đã tồn tại trong sản phẩm này',
        );
      }
    }

    const productVariant = await this.prisma.productVariant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(endow !== undefined && { endow }),
        ...(option !== undefined && { option }),
        ...(config !== undefined && { config }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            collectionId: true,
            status: true,
            hasBg: true,
          },
        },
      },
    });

    return productVariant;
  }

  async remove(id: string): Promise<{ message: string }> {
    // Kiểm tra variant có tồn tại không
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    await this.prisma.productVariant.delete({
      where: { id },
    });

    return { message: 'Xóa biến thể sản phẩm thành công' };
  }

  async findByProductId(
    productId: string,
  ): Promise<ProductVariantWithProduct[]> {
    // Kiểm tra product có tồn tại không
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const productVariants = await this.prisma.productVariant.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            collectionId: true,
            status: true,
            hasBg: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return productVariants;
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<ProductVariantWithProduct> {
    // Kiểm tra variant có tồn tại không
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    const productVariant = await this.prisma.productVariant.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            collectionId: true,
            status: true,
            hasBg: true,
          },
        },
      },
    });

    return productVariant;
  }

  async getStatistics(): Promise<{
    data: {
      totalVariants: number;
      variantsByStatus: { status: string; count: number }[];
      variantsByProduct: { productName: string; count: number }[];
      averagePrice: number;
      priceRange: { min: number; max: number };
    };
  }> {
    try {
      // Tổng số variants
      const totalVariants = await this.prisma.productVariant.count();

      // Thống kê variants theo trạng thái
      const statusStats = await this.prisma.productVariant.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const variantsByStatus = statusStats.map((stat) => ({
        status: stat.status || 'null',
        count: stat._count.status,
      }));

      // Thống kê variants theo sản phẩm (top 10)
      const productStats = await this.prisma.productVariant.groupBy({
        by: ['productId'],
        _count: {
          productId: true,
        },
        orderBy: {
          _count: {
            productId: 'desc',
          },
        },
        take: 10,
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

      const variantsByProduct = productStats.map((stat) => {
        const product = productNames.find((p) => p.id === stat.productId);
        return {
          productName: product?.name || 'Unknown',
          count: stat._count.productId,
        };
      });

      // Thống kê giá
      const priceStats = await this.prisma.productVariant.aggregate({
        _avg: {
          price: true,
        },
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      });

      return {
        data: {
          totalVariants,
          variantsByStatus,
          variantsByProduct,
          averagePrice: Number(priceStats._avg.price) || 0,
          priceRange: {
            min: Number(priceStats._min.price) || 0,
            max: Number(priceStats._max.price) || 0,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy thống kê biến thể sản phẩm');
    }
  }

  async duplicateVariant(id: string): Promise<ProductVariantWithProduct> {
    // Kiểm tra variant có tồn tại không
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!existingVariant) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    // Tạo tên mới cho variant duplicate
    let newName = `${existingVariant.name} - Copy`;
    let counter = 1;

    // Kiểm tra tên đã tồn tại chưa, nếu có thì thêm số
    while (
      await this.prisma.productVariant.findFirst({
        where: {
          name: newName,
          productId: existingVariant.productId,
        },
      })
    ) {
      counter++;
      newName = `${existingVariant.name} - Copy (${counter})`;
    }

    // Tạo variant mới
    const duplicatedVariant = await this.prisma.productVariant.create({
      data: {
        productId: existingVariant.productId,
        name: newName,
        description: existingVariant.description,
        price: existingVariant.price,
        endow: existingVariant.endow,
        option: existingVariant.option,
        config: existingVariant.config,
        status: 'draft', // Variant duplicate mặc định là draft
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            collectionId: true,
            status: true,
            hasBg: true,
          },
        },
      },
    });

    return duplicatedVariant;
  }
}
