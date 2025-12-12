import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ProductCustomsService } from './product-customs.service';
import {
  CreateProductCustomDto,
  UpdateProductCustomDto,
  GetProductCustomsQueryDto,
} from './dto';
import {
  ProductCustomWithRelations,
  PaginatedProductCustoms,
} from './entities';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { PRODUCT_CUSTOM_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('product-customs')
@UseGuards(JwtGuard, PermissionGuard)
export class ProductCustomsController {
  constructor(private readonly productCustomsService: ProductCustomsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(
    PRODUCT_CUSTOM_PERMISSIONS.CREATE,
    PRODUCT_CUSTOM_PERMISSIONS.MANAGE,
  )
  async create(
    @Body() createProductCustomDto: CreateProductCustomDto,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.create(createProductCustomDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: GetProductCustomsQueryDto,
  ): Promise<PaginatedProductCustoms> {
    return this.productCustomsService.findAll(query);
  }

  @Get('statistics')
  @RequireAnyPermission(
    PRODUCT_CUSTOM_PERMISSIONS.VIEW,
    PRODUCT_CUSTOM_PERMISSIONS.MANAGE,
  )
  async getStatistics(): Promise<{
    totalProductCustoms: number;
    totalInventories: number;
    productCustomsByStatus: { status: string; count: number }[];
    productCustomsByCategory: { categoryName: string; count: number }[];
  }> {
    return this.productCustomsService.getStatistics();
  }

  @Public()
  @Get('category/:productCategoryId')
  async findByProductCategoryId(
    @Param('productCategoryId', ParseUUIDPipe) productCategoryId: string,
  ): Promise<ProductCustomWithRelations[]> {
    return this.productCustomsService.findByProductCategoryId(
      productCategoryId,
    );
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(
    PRODUCT_CUSTOM_PERMISSIONS.UPDATE,
    PRODUCT_CUSTOM_PERMISSIONS.MANAGE,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductCustomDto: UpdateProductCustomDto,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.update(id, updateProductCustomDto);
  }

  @Patch(':id/status')
  @RequireAnyPermission(
    PRODUCT_CUSTOM_PERMISSIONS.UPDATE,
    PRODUCT_CUSTOM_PERMISSIONS.MANAGE,
  )
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequireAnyPermission(
    PRODUCT_CUSTOM_PERMISSIONS.DELETE,
    PRODUCT_CUSTOM_PERMISSIONS.MANAGE,
  )
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.productCustomsService.remove(id);
  }
}
