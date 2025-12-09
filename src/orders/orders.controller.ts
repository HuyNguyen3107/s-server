import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateBatchOrderDto } from './dto/create-batch-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { TransferOrderDto } from './dto/transfer-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import {
  RequirePermissions,
  RequireAnyPermission,
} from '../auth/decorators/permissions.decorator';
import { ORDER_PERMISSIONS } from '../permissions/constants/permissions.constants';
import { OrdersResponseInterceptor } from './interceptors/response.interceptor';
import { OrdersExceptionFilter } from './filters/orders-exception.filter';

// Custom decorator to mark routes as public (no auth required)
export const Public = () => SetMetadata('isPublic', true);

@Controller('orders')
@UseGuards(JwtGuard, PermissionGuard)
@UseInterceptors(OrdersResponseInterceptor)
@UseFilters(OrdersExceptionFilter)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ⭐ Public endpoint - Khách hàng không cần đăng nhập để tạo đơn hàng
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // ⭐ Public endpoint - Tạo đơn hàng batch (nhiều sản phẩm)
  @Public()
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createBatchOrder(@Body() createBatchOrderDto: CreateBatchOrderDto) {
    return this.ordersService.createBatchOrder(createBatchOrderDto);
  }

  // 🔍 Public endpoint - Tìm kiếm đơn hàng công khai
  @Public()
  @Get('search')
  async searchOrder(@Query() searchDto: SearchOrderDto) {
    return this.ordersService.searchOrder(searchDto.orderCode, searchDto.email);
  }

  @Get()
  @RequireAnyPermission(
    ORDER_PERMISSIONS.LIST,
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.MANAGE,
  )
  async findAll(@Query() queryDto: QueryOrderDto) {
    return this.ordersService.findAll(queryDto);
  }

  @Get('statistics')
  @RequireAnyPermission(ORDER_PERMISSIONS.VIEW, ORDER_PERMISSIONS.MANAGE)
  async getStatistics() {
    return this.ordersService.getOrderStatistics();
  }

  @Get('assigned-to-me')
  @RequireAnyPermission(
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.ASSIGN,
    ORDER_PERMISSIONS.MANAGE,
  )
  async getAssignedToMe(@Request() req: any, @Query() queryDto: QueryOrderDto) {
    return this.ordersService.getAssignedOrders(req.user.id, queryDto);
  }

  @Post(':id/assign')
  @RequireAnyPermission(ORDER_PERMISSIONS.ASSIGN, ORDER_PERMISSIONS.MANAGE)
  async assignOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.ordersService.assignOrder(id, req.user.id);
  }

  @Post(':id/unassign')
  @RequireAnyPermission(ORDER_PERMISSIONS.ASSIGN, ORDER_PERMISSIONS.MANAGE)
  async unassignOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.unassignOrder(id);
  }

  @Post(':id/transfer')
  @RequireAnyPermission(ORDER_PERMISSIONS.TRANSFER, ORDER_PERMISSIONS.MANAGE)
  async transferOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transferOrderDto: TransferOrderDto,
    @Request() req: any,
  ) {
    return this.ordersService.transferOrder(
      id,
      req.user.id,
      transferOrderDto.targetUserEmail,
    );
  }

  @Get('user/:userId')
  @RequireAnyPermission(
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.LIST,
    ORDER_PERMISSIONS.MANAGE,
  )
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() queryDto: QueryOrderDto,
  ) {
    return this.ordersService.findByUser(userId, queryDto);
  }

  @Get(':id')
  @RequireAnyPermission(ORDER_PERMISSIONS.VIEW, ORDER_PERMISSIONS.MANAGE)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(ORDER_PERMISSIONS.UPDATE, ORDER_PERMISSIONS.MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @RequireAnyPermission(
    ORDER_PERMISSIONS.UPDATE_STATUS,
    ORDER_PERMISSIONS.MANAGE,
  )
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @RequireAnyPermission(ORDER_PERMISSIONS.DELETE, ORDER_PERMISSIONS.MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
