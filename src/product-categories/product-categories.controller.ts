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
import { ProductCategoriesService } from './product-categories.service';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  GetProductCategoriesQueryDto,
} from './dto';
import {
  JwtGuard,
  GetUser,
  UserPayload,
  PermissionGuard,
  RequireAnyPermission,
} from '../auth';
import { PRODUCT_CATEGORY_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('product-categories')
@UseGuards(JwtGuard, PermissionGuard)
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(
    PRODUCT_CATEGORY_PERMISSIONS.CREATE,
    PRODUCT_CATEGORY_PERMISSIONS.MANAGE,
  )
  async create(
    @Body(ValidationPipe) createProductCategoryDto: CreateProductCategoryDto,
    @GetUser() user: UserPayload,
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo thể loại sản phẩm thành công',
      data: await this.productCategoriesService.create(
        createProductCategoryDto,
      ),
    };
  }

  @Public()
  @Get()
  async findAll(@Query(ValidationPipe) query: GetProductCategoriesQueryDto) {
    const result = await this.productCategoriesService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách thể loại sản phẩm thành công',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('statistics')
  @RequireAnyPermission(
    PRODUCT_CATEGORY_PERMISSIONS.VIEW,
    PRODUCT_CATEGORY_PERMISSIONS.MANAGE,
  )
  async getStatistics(@GetUser() user: UserPayload) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thống kê thể loại sản phẩm thành công',
      data: await this.productCategoriesService.getStatistics(),
    };
  }

  @Public()
  @Get('product/:productId')
  async findByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thể loại theo sản phẩm thành công',
      data: await this.productCategoriesService.findByProductId(productId),
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin thể loại sản phẩm thành công',
      data: await this.productCategoriesService.findOne(id),
    };
  }

  @Patch(':id')
  @RequireAnyPermission(
    PRODUCT_CATEGORY_PERMISSIONS.UPDATE,
    PRODUCT_CATEGORY_PERMISSIONS.MANAGE,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProductCategoryDto: UpdateProductCategoryDto,
    @GetUser() user: UserPayload,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật thể loại sản phẩm thành công',
      data: await this.productCategoriesService.update(
        id,
        updateProductCategoryDto,
      ),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequireAnyPermission(
    PRODUCT_CATEGORY_PERMISSIONS.DELETE,
    PRODUCT_CATEGORY_PERMISSIONS.MANAGE,
  )
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    const result = await this.productCategoriesService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}
