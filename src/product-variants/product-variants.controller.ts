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
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  GetProductVariantsQueryDto,
  UpdateProductVariantStatusDto,
} from './dto';

@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  findAll(@Query() query: GetProductVariantsQueryDto) {
    return this.productVariantsService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.productVariantsService.getStatistics();
  }

  @Get('product/:productId')
  findByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productVariantsService.findByProductId(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateProductVariantStatusDto,
  ) {
    return this.productVariantsService.updateStatus(id, updateStatusDto.status);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  duplicateVariant(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.duplicateVariant(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.remove(id);
  }
}
