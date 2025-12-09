import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  UpdateInventoryDto,
  StockAdjustmentDto,
  ReserveStockDto,
} from './dto/update-inventory.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    try {
      // Kiểm tra xem product custom có tồn tại không
      const productCustom = await this.prisma.productCustom.findUnique({
        where: { id: createInventoryDto.productCustomId },
      });

      if (!productCustom) {
        throw new BadRequestException('Product custom không tồn tại');
      }

      // Kiểm tra xem inventory đã tồn tại cho product custom này chưa
      const existingInventory = await this.prisma.inventory.findFirst({
        where: { productCustomId: createInventoryDto.productCustomId },
      });

      if (existingInventory) {
        throw new BadRequestException(
          'Inventory đã tồn tại cho product custom này',
        );
      }

      const inventory = await this.prisma.inventory.create({
        data: {
          productCustomId: createInventoryDto.productCustomId,
          currentStock: createInventoryDto.currentStock ?? 0,
          reservedStock: createInventoryDto.reservedStock ?? 0,
          minStockAlert: createInventoryDto.minStockAlert ?? 5,
          status: createInventoryDto.status ?? 'active',
        },
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: 'Tạo inventory thành công',
        data: inventory,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo inventory');
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.InventoryWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.productCustom = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const [inventories, total] = await Promise.all([
        this.prisma.inventory.findMany({
          where,
          skip,
          take: limit,
          include: {
            productCustom: {
              include: {
                productCategory: {
                  include: {
                    product: {
                      include: {
                        collection: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.inventory.count({ where }),
      ]);

      return {
        success: true,
        data: inventories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách inventory');
    }
  }

  async findOne(id: string) {
    try {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id },
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!inventory) {
        throw new NotFoundException('Không tìm thấy inventory');
      }

      return {
        success: true,
        data: inventory,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin inventory');
    }
  }

  async findByProductCustom(productCustomId: string) {
    try {
      const inventory = await this.prisma.inventory.findFirst({
        where: { productCustomId },
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!inventory) {
        throw new NotFoundException(
          'Không tìm thấy inventory cho product custom này',
        );
      }

      return {
        success: true,
        data: inventory,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin inventory');
    }
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    try {
      const existingInventory = await this.prisma.inventory.findUnique({
        where: { id },
      });

      if (!existingInventory) {
        throw new NotFoundException('Không tìm thấy inventory');
      }

      const inventory = await this.prisma.inventory.update({
        where: { id },
        data: {
          ...updateInventoryDto,
          updatedAt: new Date(),
        },
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: 'Cập nhật inventory thành công',
        data: inventory,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật inventory');
    }
  }

  async adjustStock(id: string, stockAdjustmentDto: StockAdjustmentDto) {
    try {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id },
      });

      if (!inventory) {
        throw new NotFoundException('Không tìm thấy inventory');
      }

      const newStock =
        (inventory.currentStock ?? 0) + stockAdjustmentDto.quantity;

      if (newStock < 0) {
        throw new BadRequestException('Số lượng tồn kho không thể âm');
      }

      const updatedInventory = await this.prisma.inventory.update({
        where: { id },
        data: {
          currentStock: newStock,
          updatedAt: new Date(),
        },
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: `Điều chỉnh stock thành công: ${stockAdjustmentDto.quantity > 0 ? '+' : ''}${stockAdjustmentDto.quantity}`,
        data: updatedInventory,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể điều chỉnh stock');
    }
  }

  async reserveStock(id: string, reserveStockDto: ReserveStockDto) {
    try {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id },
      });

      if (!inventory) {
        throw new NotFoundException('Không tìm thấy inventory');
      }

      const availableStock =
        (inventory.currentStock ?? 0) - (inventory.reservedStock ?? 0);

      if (availableStock < reserveStockDto.quantity) {
        throw new BadRequestException('Không đủ stock để reserve');
      }

      const updatedInventory = await this.prisma.inventory.update({
        where: { id },
        data: {
          reservedStock:
            (inventory.reservedStock ?? 0) + reserveStockDto.quantity,
          updatedAt: new Date(),
        },
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: `Reserve stock thành công: ${reserveStockDto.quantity} sản phẩm`,
        data: updatedInventory,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể reserve stock');
    }
  }

  async releaseReservedStock(id: string, quantity: number) {
    try {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id },
      });

      if (!inventory) {
        throw new NotFoundException('Không tìm thấy inventory');
      }

      const currentReserved = inventory.reservedStock ?? 0;

      if (currentReserved < quantity) {
        throw new BadRequestException(
          'Số lượng release vượt quá stock đã reserve',
        );
      }

      const updatedInventory = await this.prisma.inventory.update({
        where: { id },
        data: {
          reservedStock: currentReserved - quantity,
          updatedAt: new Date(),
        },
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: `Release reserved stock thành công: ${quantity} sản phẩm`,
        data: updatedInventory,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể release reserved stock');
    }
  }

  async getLowStockItems(limit: number = 10) {
    try {
      const lowStockItems = await this.prisma.inventory.findMany({
        where: {
          AND: [
            { status: 'active' },
            {
              OR: [
                {
                  currentStock: {
                    lte: this.prisma.inventory.fields.minStockAlert,
                  },
                },
                { currentStock: { lte: 10 } }, // fallback if minStockAlert is null
              ],
            },
          ],
        },
        take: limit,
        include: {
          productCustom: {
            include: {
              productCategory: {
                include: {
                  product: {
                    include: {
                      collection: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { currentStock: 'asc' },
      });

      return {
        success: true,
        data: lowStockItems,
        message: `Tìm thấy ${lowStockItems.length} sản phẩm sắp hết hàng`,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy danh sách sản phẩm sắp hết hàng',
      );
    }
  }

  async getStockReport() {
    try {
      const [totalItems, lowStockCount, outOfStockCount, totalValue] =
        await Promise.all([
          this.prisma.inventory.count({ where: { status: 'active' } }),
          this.prisma.inventory.count({
            where: {
              AND: [
                { status: 'active' },
                { currentStock: { gt: 0 } },
                {
                  OR: [
                    {
                      currentStock: {
                        lte: this.prisma.inventory.fields.minStockAlert,
                      },
                    },
                    { currentStock: { lte: 10 } },
                  ],
                },
              ],
            },
          }),
          this.prisma.inventory.count({
            where: {
              AND: [
                { status: 'active' },
                {
                  OR: [{ currentStock: 0 }, { currentStock: null }],
                },
              ],
            },
          }),
          this.prisma.$queryRaw`
          SELECT COALESCE(SUM(i.current_stock * pc.price), 0) as total
          FROM inventory i
          JOIN product_customs pc ON i.product_custom_id = pc.id
          WHERE i.status = 'active'
        `,
        ]);

      return {
        success: true,
        data: {
          totalItems,
          lowStockCount,
          outOfStockCount,
          totalValue: totalValue[0]?.total || 0,
          healthyStockCount: totalItems - lowStockCount - outOfStockCount,
        },
      };
    } catch (error) {
      throw new BadRequestException('Không thể tạo báo cáo tồn kho');
    }
  }

  async remove(id: string) {
    try {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id },
      });

      if (!inventory) {
        throw new NotFoundException('Không tìm thấy inventory');
      }

      await this.prisma.inventory.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Xóa inventory thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa inventory');
    }
  }
}
