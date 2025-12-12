import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  GetProductVariantsQueryDto,
  UpdateProductVariantStatusDto,
} from './dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { PRODUCT_VARIANT_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('product-variants')
@UseGuards(JwtGuard, PermissionGuard)
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(
    PRODUCT_VARIANT_PERMISSIONS.CREATE,
    PRODUCT_VARIANT_PERMISSIONS.MANAGE,
  )
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: GetProductVariantsQueryDto) {
    return this.productVariantsService.findAll(query);
  }

  @Get('statistics')
  @RequireAnyPermission(
    PRODUCT_VARIANT_PERMISSIONS.VIEW,
    PRODUCT_VARIANT_PERMISSIONS.MANAGE,
  )
  getStatistics() {
    return this.productVariantsService.getStatistics();
  }

  @Public()
  @Get('product/:productId')
  findByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productVariantsService.findByProductId(productId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(
    PRODUCT_VARIANT_PERMISSIONS.UPDATE,
    PRODUCT_VARIANT_PERMISSIONS.MANAGE,
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Patch(':id/status')
  @RequireAnyPermission(
    PRODUCT_VARIANT_PERMISSIONS.UPDATE,
    PRODUCT_VARIANT_PERMISSIONS.MANAGE,
  )
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateProductVariantStatusDto,
  ) {
    return this.productVariantsService.updateStatus(id, updateStatusDto.status);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(
    PRODUCT_VARIANT_PERMISSIONS.CREATE,
    PRODUCT_VARIANT_PERMISSIONS.MANAGE,
  )
  duplicateVariant(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.duplicateVariant(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequireAnyPermission(
    PRODUCT_VARIANT_PERMISSIONS.DELETE,
    PRODUCT_VARIANT_PERMISSIONS.MANAGE,
  )
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.remove(id);
  }
}
