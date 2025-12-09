import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateBatchOrderDto } from './dto/create-batch-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { generateOrderCode } from './utils/generate-order-code.util';
import { OrderInformation } from './types/order-information.interface';
import {
  BatchOrderInformation,
  BatchOrderItem,
} from './types/batch-order-information.interface';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Verify user exists if userId is provided
      if (createOrderDto.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: createOrderDto.userId },
        });

        if (!user) {
          throw new BadRequestException('User not found');
        }
      }

      // Generate order code
      const orderCode = await generateOrderCode(this.prisma);

      // Build order information from orderData
      const orderInformation: OrderInformation = {
        orderCode,
        collection: createOrderDto.orderData.collection,
        product: createOrderDto.orderData.product,
        variant: createOrderDto.orderData.variant,
        selectedOptions: createOrderDto.orderData.selectedOptions,
        customQuantities: createOrderDto.orderData.customQuantities,
        selectedCategoryProducts:
          createOrderDto.orderData.selectedCategoryProducts,
        multiItemCustomizations:
          createOrderDto.orderData.multiItemCustomizations,
        background: createOrderDto.orderData.background,
        shipping: createOrderDto.orderData.shipping,
        promotion: createOrderDto.orderData.promotion,
        pricing: createOrderDto.orderData.pricing,
        contactInfo: {
          name:
            (createOrderDto.orderData.background?.formData?.values || []).find(
              (field: any) => field.fieldTitle === 'Họ và tên',
            )?.value || 'Khách hàng',
          phone:
            (createOrderDto.orderData.background?.formData?.values || []).find(
              (field: any) => field.fieldTitle === 'Số điện thoại',
            )?.value || '',
          email:
            (createOrderDto.orderData.background?.formData?.values || []).find(
              (field: any) => field.fieldTitle === 'Email',
            )?.value || '',
        },
        metadata: {
          ...createOrderDto.orderData.metadata,
          createdAt: new Date().toISOString(),
        },
      };

      // Create order with default status 'pending' and userId = null
      const order = await this.prisma.order.create({
        data: {
          userId: null, // Will be assigned when admin/staff processes the order
          status: createOrderDto.status || 'pending',
          information: orderInformation as any,
        },
        include: {
          user: false, // No user assigned yet
        },
      });

      // 📦 Trừ số lượng sản phẩm tùy chỉnh trong kho
      await this.deductInventoryFromOrder(orderInformation);

      // 🔔 Emit notification to admin về đơn hàng mới
      // Extract customer info from background form data
      const formData =
        createOrderDto.orderData.background?.formData?.values || [];
      const customerName =
        formData.find((field) => field.fieldTitle === 'Họ và tên')?.value ||
        'Khách hàng';
      const customerPhone =
        formData.find((field) => field.fieldTitle === 'Số điện thoại')?.value ||
        '';
      const customerEmail =
        formData.find((field) => field.fieldTitle === 'Email')?.value || '';

      this.notificationsGateway.emitNewOrder({
        id: order.id,
        orderCode,
        status: order.status,
        createdAt: order.createdAt,
        customerInfo: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        totalAmount: createOrderDto.orderData.pricing?.total || 0,
        products: createOrderDto.orderData.product?.name || 'Sản phẩm',
        message: 'Có đơn hàng mới cần xử lý',
      });

      return {
        success: true,
        message: 'Order created successfully',
        data: {
          ...order,
          orderCode, // Include order code in response for easy access
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create order');
    }
  }

  /**
   * Tạo đơn hàng batch (nhiều sản phẩm trong 1 đơn)
   */
  async createBatchOrder(createBatchOrderDto: CreateBatchOrderDto) {
    try {
      // Verify user exists if userId is provided
      if (createBatchOrderDto.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: createBatchOrderDto.userId },
        });

        if (!user) {
          throw new BadRequestException('User not found');
        }
      }

      // Validate có ít nhất 1 item
      if (
        !createBatchOrderDto.items ||
        createBatchOrderDto.items.length === 0
      ) {
        throw new BadRequestException(
          'Batch order must have at least one item',
        );
      }

      // Generate order code
      const orderCode = await generateOrderCode(this.prisma);

      // Build batch order items
      const batchItems: BatchOrderItem[] = createBatchOrderDto.items.map(
        (item, index) => ({
          itemIndex: index,
          collection: item.collection,
          product: item.product,
          variant: item.variant,
          selectedOptions: item.selectedOptions,
          customQuantities: item.customQuantities,
          selectedCategoryProducts: item.selectedCategoryProducts,
          multiItemCustomizations: item.multiItemCustomizations,
          background: item.background,
          pricing: item.pricing,
          metadata: item.metadata,
        }),
      );

      // Build batch order information
      const batchOrderInformation: BatchOrderInformation = {
        orderCode,
        isBatchOrder: true,
        itemCount: batchItems.length,
        customerInfo: createBatchOrderDto.customerInfo,
        items: batchItems,
        shipping: createBatchOrderDto.shipping,
        promotion: createBatchOrderDto.promotion,
        pricing: createBatchOrderDto.pricing,
        metadata: {
          ...createBatchOrderDto.metadata,
          createdAt: new Date().toISOString(),
        },
      };

      // Create order with batch information
      const order = await this.prisma.order.create({
        data: {
          userId: createBatchOrderDto.userId || null,
          status: 'pending',
          information: batchOrderInformation as any,
        },
        include: {
          user: createBatchOrderDto.userId
            ? {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  phone: true,
                },
              }
            : false,
        },
      });

      // 📦 Trừ số lượng sản phẩm tùy chỉnh trong kho
      await this.deductInventoryFromOrder(batchOrderInformation);

      // 🔔 Emit notification to admin về đơn hàng mới
      const productNames = batchItems
        .map((item) => item.product?.name || 'Sản phẩm')
        .join(', ');

      this.notificationsGateway.emitNewOrder({
        id: order.id,
        orderCode,
        status: order.status,
        createdAt: order.createdAt,
        customerInfo: {
          name: createBatchOrderDto.customerInfo.name,
          phone: createBatchOrderDto.customerInfo.phone,
          email: createBatchOrderDto.customerInfo.email || '',
        },
        totalAmount: createBatchOrderDto.pricing.total,
        products: `${batchItems.length} sản phẩm: ${productNames}`,
        message: `Có đơn hàng mới với ${batchItems.length} sản phẩm cần xử lý`,
      });

      return {
        success: true,
        message: 'Batch order created successfully',
        data: {
          ...order,
          orderCode,
          itemCount: batchItems.length,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create batch order',
      );
    }
  }

  async findAll(queryDto: QueryOrderDto = {}) {
    const {
      userId,
      status,
      orderCode,
      customerName,
      phone,
      startDate,
      endDate,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    // Search by order code (stored in information.orderCode)
    if (orderCode) {
      where.AND = where.AND || [];
      where.AND.push({
        information: {
          path: ['orderCode'],
          string_contains: orderCode.toUpperCase(),
        },
      });
    }

    // Search by customer name / phone (stored in information.contactInfo if present)
    // For legacy orders without contactInfo, this filter will simply not match
    if (customerName) {
      where.AND = where.AND || [];
      where.AND.push({
        information: {
          path: ['contactInfo', 'name'],
          string_contains: customerName.toLowerCase(),
        },
      });
    }

    if (phone) {
      where.AND = where.AND || [];
      where.AND.push({
        information: {
          path: ['contactInfo', 'phone'],
          string_contains: phone,
        },
      });
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const orderBy = {
      [sortBy]: sortOrder,
    };

    try {
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy,
          skip,
          take,
        }),
        this.prisma.order.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: take,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve orders');
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve order');
    }
  }

  async findByUser(userId: string, queryDto: QueryOrderDto = {}) {
    const {
      status,
      startDate,
      endDate,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const orderBy = {
      [sortBy]: sortOrder,
    };

    try {
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy,
          skip,
          take,
        }),
        this.prisma.order.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        message: 'User orders retrieved successfully',
        data: {
          orders,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: take,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve user orders');
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      // Check if order exists
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const order = await this.prisma.order.update({
        where: { id },
        data: {
          ...updateOrderDto,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Order updated successfully',
        data: order,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to update order');
    }
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    try {
      // Check if order exists
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Append status history into information.metadata.statusHistory
      const info = (existingOrder.information as any) || {};
      const metadata = info.metadata || {};
      const history = Array.isArray(metadata.statusHistory)
        ? metadata.statusHistory
        : [];
      history.unshift({
        from: existingOrder.status,
        to: updateStatusDto.status,
        at: new Date().toISOString(),
      });
      metadata.statusHistory = history;
      info.metadata = metadata;

      const order = await this.prisma.order.update({
        where: { id },
        data: {
          status: updateStatusDto.status,
          updatedAt: new Date(),
          information: info as any,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      // Emit notification for status update
      const orderInfo = order.information as any;
      const orderCode = orderInfo?.orderCode || id;
      this.notificationsGateway.emitOrderStatusUpdate({
        id,
        orderCode,
        status: order.status,
        createdAt: order.createdAt,
      });

      return {
        success: true,
        message: 'Order status updated successfully',
        data: order,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to update order status',
      );
    }
  }

  /**
   * Xóa đơn hàng và hoàn lại số lượng sản phẩm tùy chỉnh trong kho
   */
  async remove(id: string) {
    try {
      // Check if order exists
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const orderInfo = existingOrder.information as any;

      // Hoàn lại số lượng sản phẩm tùy chỉnh trong kho trước khi xóa đơn hàng
      await this.restoreInventoryFromOrder(orderInfo);

      // Xóa các notification liên quan đến đơn hàng này
      await this.prisma.notification.deleteMany({
        where: {
          OR: [
            { data: { path: ['orderId'], equals: id } },
            { data: { path: ['orderCode'], equals: orderInfo?.orderCode } },
          ],
        },
      });

      // Xóa đơn hàng
      await this.prisma.order.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Order deleted successfully and inventory restored',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to delete order');
    }
  }

  /**
   * Helper method để hoàn lại số lượng sản phẩm tùy chỉnh từ đơn hàng
   * Hỗ trợ cả single order và batch order
   */
  private async restoreInventoryFromOrder(orderInfo: any) {
    if (!orderInfo) return;

    // Kiểm tra xem có phải batch order không
    const isBatchOrder = orderInfo.isBatchOrder === true;

    if (isBatchOrder && orderInfo.items) {
      // Batch order: xử lý từng item
      for (const item of orderInfo.items) {
        await this.restoreInventoryFromOrderItem(item);
      }
    } else {
      // Single order: xử lý trực tiếp
      await this.restoreInventoryFromOrderItem(orderInfo);
    }
  }

  /**
   * Helper method để hoàn lại số lượng sản phẩm tùy chỉnh từ một item đơn hàng
   */
  private async restoreInventoryFromOrderItem(orderItem: any) {
    if (!orderItem) return;

    // Collect tất cả các productCustomId và quantity cần restore
    const productsToRestore: Map<string, number> = new Map();

    // 1. Xử lý selectedCategoryProducts
    if (orderItem.selectedCategoryProducts) {
      for (const categoryData of Object.values(
        orderItem.selectedCategoryProducts,
      ) as any[]) {
        if (categoryData?.products) {
          for (const product of categoryData.products) {
            if (product.productCustomId && product.quantity > 0) {
              const currentQty =
                productsToRestore.get(product.productCustomId) || 0;
              productsToRestore.set(
                product.productCustomId,
                currentQty + product.quantity,
              );
            }
          }
        }
      }
    }

    // 2. Xử lý multiItemCustomizations
    if (orderItem.multiItemCustomizations) {
      for (const itemCustomization of Object.values(
        orderItem.multiItemCustomizations,
      ) as any[]) {
        if (itemCustomization) {
          for (const categoryData of Object.values(
            itemCustomization,
          ) as any[]) {
            if (categoryData?.products) {
              for (const product of categoryData.products) {
                if (product.productCustomId && product.quantity > 0) {
                  const currentQty =
                    productsToRestore.get(product.productCustomId) || 0;
                  productsToRestore.set(
                    product.productCustomId,
                    currentQty + product.quantity,
                  );
                }
              }
            }
          }
        }
      }
    }

    // 3. Restore inventory cho từng product custom
    for (const [productCustomId, quantity] of productsToRestore) {
      try {
        // Tìm inventory của product custom
        const inventory = await this.prisma.inventory.findFirst({
          where: { productCustomId },
        });

        if (inventory) {
          // Cộng lại số lượng vào currentStock
          await this.prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              currentStock: (inventory.currentStock || 0) + quantity,
              updatedAt: new Date(),
            },
          });

          console.log(
            `[Order Delete] Restored ${quantity} units to inventory for productCustom ${productCustomId}`,
          );
        }
      } catch (err) {
        console.error(
          `[Order Delete] Failed to restore inventory for productCustom ${productCustomId}:`,
          err,
        );
        // Không throw error để tiếp tục xử lý các sản phẩm khác
      }
    }
  }

  /**
   * Helper method để trừ số lượng sản phẩm tùy chỉnh trong kho khi tạo đơn hàng
   * Hỗ trợ cả single order và batch order
   */
  private async deductInventoryFromOrder(orderInfo: any) {
    if (!orderInfo) return;

    // Kiểm tra xem có phải batch order không
    const isBatchOrder = orderInfo.isBatchOrder === true;

    if (isBatchOrder && orderInfo.items) {
      // Batch order: xử lý từng item
      for (const item of orderInfo.items) {
        await this.deductInventoryFromOrderItem(item);
      }
    } else {
      // Single order: xử lý trực tiếp
      await this.deductInventoryFromOrderItem(orderInfo);
    }
  }

  /**
   * Helper method để trừ số lượng sản phẩm tùy chỉnh từ một item đơn hàng
   */
  private async deductInventoryFromOrderItem(orderItem: any) {
    if (!orderItem) return;

    // Collect tất cả các productCustomId và quantity cần trừ
    const productsToDeduct: Map<string, number> = new Map();

    // 1. Xử lý selectedCategoryProducts
    if (orderItem.selectedCategoryProducts) {
      for (const categoryData of Object.values(
        orderItem.selectedCategoryProducts,
      ) as any[]) {
        if (categoryData?.products) {
          for (const product of categoryData.products) {
            if (product.productCustomId && product.quantity > 0) {
              const currentQty =
                productsToDeduct.get(product.productCustomId) || 0;
              productsToDeduct.set(
                product.productCustomId,
                currentQty + product.quantity,
              );
            }
          }
        }
      }
    }

    // 2. Xử lý multiItemCustomizations
    if (orderItem.multiItemCustomizations) {
      for (const itemCustomization of Object.values(
        orderItem.multiItemCustomizations,
      ) as any[]) {
        if (itemCustomization) {
          for (const categoryData of Object.values(
            itemCustomization,
          ) as any[]) {
            if (categoryData?.products) {
              for (const product of categoryData.products) {
                if (product.productCustomId && product.quantity > 0) {
                  const currentQty =
                    productsToDeduct.get(product.productCustomId) || 0;
                  productsToDeduct.set(
                    product.productCustomId,
                    currentQty + product.quantity,
                  );
                }
              }
            }
          }
        }
      }
    }

    // 3. Trừ inventory cho từng product custom
    for (const [productCustomId, quantity] of productsToDeduct) {
      try {
        // Tìm inventory của product custom
        const inventory = await this.prisma.inventory.findFirst({
          where: { productCustomId },
        });

        if (inventory) {
          const newStock = Math.max(
            0,
            (inventory.currentStock || 0) - quantity,
          );

          // Trừ số lượng từ currentStock
          await this.prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              currentStock: newStock,
              updatedAt: new Date(),
            },
          });

          console.log(
            `[Order Create] Deducted ${quantity} units from inventory for productCustom ${productCustomId}. New stock: ${newStock}`,
          );
        }
      } catch (err) {
        console.error(
          `[Order Create] Failed to deduct inventory for productCustom ${productCustomId}:`,
          err,
        );
        // Không throw error để tiếp tục xử lý các sản phẩm khác
      }
    }
  }

  async getOrderStatistics() {
    try {
      const totalOrders = await this.prisma.order.count();
      const ordersByStatus: Record<string, number> = {};
      for (const status of require('./validators/order-status.validator')
        .ORDER_STATUSES) {
        ordersByStatus[status] = await this.prisma.order.count({
          where: { status },
        });
      }

      return {
        success: true,
        message: 'Order statistics retrieved successfully',
        data: {
          totalOrders,
          ordersByStatus,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve order statistics');
    }
  }

  // ⭐ Assign order to user (admin/staff claims the order)
  async assignOrder(orderId: string, userId: string) {
    try {
      // Verify order exists
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if order is already assigned
      if (order.userId) {
        const assignedUser = await this.prisma.user.findUnique({
          where: { id: order.userId },
          select: { name: true },
        });
        throw new ForbiddenException(
          `Order is already assigned to ${assignedUser?.name || 'another user'}`,
        );
      }

      // Assign order to user
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Extract order code from information
      const orderInfo = updatedOrder.information as any;
      const orderCode = orderInfo?.orderCode || orderId;

      // Update notification with assignee info
      this.notificationsService.updateNotificationAssignee(
        orderId,
        user.id,
        user.name,
      );

      // Emit update via WebSocket
      this.notificationsGateway.emitOrderAssigned({
        orderId: updatedOrder.id,
        orderCode,
        assignedTo: {
          userId: user.id,
          userName: user.name,
        },
      });

      return {
        success: true,
        message: `Order assigned to ${user.name} successfully`,
        data: {
          order: updatedOrder,
          assignedTo: user,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to assign order');
    }
  }

  // ⭐ Unassign order from user
  async unassignOrder(orderId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      if (!order.userId) {
        throw new BadRequestException('Order is not assigned to anyone');
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { userId: null },
      });

      // Remove assignee from notification
      this.notificationsService.updateNotificationAssignee(orderId, null, null);

      return {
        success: true,
        message: 'Order unassigned successfully',
        data: updatedOrder,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to unassign order');
    }
  }

  // ⭐ Transfer order to another user
  async transferOrder(
    orderId: string,
    currentUserId: string,
    targetUserEmail: string,
  ) {
    try {
      // Verify order exists
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Verify current user owns this order
      if (order.userId !== currentUserId) {
        throw new ForbiddenException(
          'You can only transfer orders assigned to you',
        );
      }

      // Find target user by email
      const targetUser = await this.prisma.user.findUnique({
        where: { email: targetUserEmail },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!targetUser) {
        throw new NotFoundException(
          `User with email ${targetUserEmail} not found`,
        );
      }

      // Cannot transfer to self
      if (targetUser.id === currentUserId) {
        throw new BadRequestException('Cannot transfer order to yourself');
      }

      // Transfer order to target user
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { userId: targetUser.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Extract order code from information
      const orderInfo = updatedOrder.information as any;
      const orderCode = orderInfo?.orderCode || orderId;

      // Update notification with new assignee
      this.notificationsService.updateNotificationAssignee(
        orderId,
        targetUser.id,
        targetUser.name,
      );

      // Emit transfer event via WebSocket
      this.notificationsGateway.emitOrderAssigned({
        orderId: updatedOrder.id,
        orderCode,
        assignedTo: {
          userId: targetUser.id,
          userName: targetUser.name,
        },
      });

      return {
        success: true,
        message: `Order transferred to ${targetUser.name} successfully`,
        data: {
          order: updatedOrder,
          transferredFrom: order.user,
          transferredTo: targetUser,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to transfer order');
    }
  }

  // ⭐ Get orders assigned to a specific user
  async getAssignedOrders(userId: string, queryDto?: QueryOrderDto) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        minPrice,
        maxPrice,
      } = queryDto || {};
      const numPage = typeof page === 'string' ? parseInt(page, 10) : page;
      const numLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

      const where: any = {
        userId, // Only orders assigned to this user
      };

      if (status) {
        where.status = status;
      }

      // Filter by date range
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          // Add 1 day to include the end date
          const endDateTime = new Date(endDate);
          endDateTime.setDate(endDateTime.getDate() + 1);
          where.createdAt.lt = endDateTime;
        }
      }

      // If price filter is applied, we need to fetch all and filter in memory
      // because pricing is stored in JSON field
      if (minPrice !== undefined || maxPrice !== undefined) {
        // Fetch all orders matching other criteria
        const allOrders = await this.prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Filter by price in application layer
        const filteredOrders = allOrders.filter((order) => {
          const total = (order.information as any)?.pricing?.total;
          if (total === undefined) return false;

          if (minPrice !== undefined && total < minPrice) return false;
          if (maxPrice !== undefined && total > maxPrice) return false;

          return true;
        });

        // Apply pagination
        const skip = (numPage - 1) * numLimit;
        const paginatedOrders = filteredOrders.slice(skip, skip + numLimit);
        const total = filteredOrders.length;

        return {
          success: true,
          message: 'Assigned orders retrieved successfully',
          data: paginatedOrders,
          pagination: {
            total,
            page: numPage,
            limit: numLimit,
            totalPages: Math.ceil(total / numLimit),
          },
        };
      }

      // No price filter - use regular pagination
      const skip = (numPage - 1) * numLimit;
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: numLimit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        success: true,
        message: 'Assigned orders retrieved successfully',
        data: orders,
        pagination: {
          total,
          page: numPage,
          limit: numLimit,
          totalPages: Math.ceil(total / numLimit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve assigned orders');
    }
  }

  // 🔍 Public search order - Tìm kiếm đơn hàng công khai cho khách hàng
  async searchOrder(orderCode?: string, email?: string) {
    try {
      if (!orderCode && !email) {
        throw new BadRequestException(
          'Vui lòng cung cấp mã đơn hàng hoặc email để tìm kiếm',
        );
      }

      const whereCondition: any = {};

      // Tìm theo cả mã đơn hàng và email (chính xác hơn)
      if (orderCode && email) {
        whereCondition.AND = [
          {
            information: {
              path: ['orderCode'],
              equals: orderCode.toUpperCase(),
            },
          },
          {
            information: {
              path: ['contactInfo', 'email'],
              string_contains: email.toLowerCase(),
            },
          },
        ];
      }
      // Chỉ tìm theo mã đơn hàng
      else if (orderCode) {
        whereCondition.information = {
          path: ['orderCode'],
          equals: orderCode.toUpperCase(),
        };
      }
      // Chỉ tìm theo email
      else if (email) {
        whereCondition.information = {
          path: ['contactInfo', 'email'],
          string_contains: email.toLowerCase(),
        };
      }

      const orders = await this.prisma.order.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Giới hạn kết quả
      });

      if (orders.length === 0) {
        return {
          success: false,
          message: 'Không tìm thấy đơn hàng nào',
          data: [],
        };
      }

      return {
        success: true,
        message: `Tìm thấy ${orders.length} đơn hàng`,
        data: orders,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tìm kiếm đơn hàng');
    }
  }
}
