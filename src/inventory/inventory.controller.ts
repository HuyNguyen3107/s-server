import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  UpdateInventoryDto,
  StockAdjustmentDto,
  ReserveStockDto,
} from './dto/update-inventory.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { INVENTORY_PERMISSIONS } from '../permissions/constants/permissions.constants';

@Controller('inventory')
@UseGuards(JwtGuard, PermissionGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.CREATE,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.LIST,
    INVENTORY_PERMISSIONS.VIEW,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.inventoryService.findAll(page, limit, search, status);
  }

  @Get('low-stock')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.VIEW,
    INVENTORY_PERMISSIONS.REPORT,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  getLowStockItems(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.inventoryService.getLowStockItems(limit);
  }

  @Get('report')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.REPORT,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  getStockReport() {
    return this.inventoryService.getStockReport();
  }

  @Get('product-custom/:productCustomId')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.VIEW,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  findByProductCustom(@Param('productCustomId') productCustomId: string) {
    return this.inventoryService.findByProductCustom(productCustomId);
  }

  @Get(':id')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.VIEW,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.UPDATE,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Post(':id/adjust-stock')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.ADJUST,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  adjustStock(
    @Param('id') id: string,
    @Body() stockAdjustmentDto: StockAdjustmentDto,
  ) {
    return this.inventoryService.adjustStock(id, stockAdjustmentDto);
  }

  @Post(':id/reserve-stock')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.RESERVE,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  reserveStock(
    @Param('id') id: string,
    @Body() reserveStockDto: ReserveStockDto,
  ) {
    return this.inventoryService.reserveStock(id, reserveStockDto);
  }

  @Post(':id/release-reserved-stock')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.RESERVE,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  releaseReservedStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return this.inventoryService.releaseReservedStock(id, body.quantity);
  }

  @Delete(':id')
  @RequireAnyPermission(
    INVENTORY_PERMISSIONS.DELETE,
    INVENTORY_PERMISSIONS.MANAGE,
  )
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
