import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, GetProductsQueryDto } from './dto';
import {
  JwtGuard,
  GetUser,
  UserPayload,
  PermissionGuard,
  RequireAnyPermission,
} from '../auth';
import { PRODUCT_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('products')
@UseGuards(JwtGuard, PermissionGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(PRODUCT_PERMISSIONS.CREATE, PRODUCT_PERMISSIONS.MANAGE)
  async create(@Body(ValidationPipe) createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  async findAll(@Query(ValidationPipe) query: GetProductsQueryDto) {
    return await this.productsService.findAll(query);
  }

  @Get('statistics')
  @RequireAnyPermission(PRODUCT_PERMISSIONS.VIEW, PRODUCT_PERMISSIONS.MANAGE)
  async getStatistics(@GetUser() user: UserPayload) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thống kê sản phẩm thành công',
      data: await this.productsService.getStatistics(),
    };
  }

  @Public()
  @Get('collection/:collectionId')
  async findByCollectionId(
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
  ) {
    return await this.productsService.findByCollectionId(collectionId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(PRODUCT_PERMISSIONS.UPDATE, PRODUCT_PERMISSIONS.MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/status')
  @RequireAnyPermission(PRODUCT_PERMISSIONS.UPDATE, PRODUCT_PERMISSIONS.MANAGE)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return await this.productsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequireAnyPermission(PRODUCT_PERMISSIONS.DELETE, PRODUCT_PERMISSIONS.MANAGE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.remove(id);
  }
}
