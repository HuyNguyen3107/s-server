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

@Controller('product-customs')
export class ProductCustomsController {
  constructor(private readonly productCustomsService: ProductCustomsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductCustomDto: CreateProductCustomDto,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.create(createProductCustomDto);
  }

  @Get()
  async findAll(
    @Query() query: GetProductCustomsQueryDto,
  ): Promise<PaginatedProductCustoms> {
    return this.productCustomsService.findAll(query);
  }

  @Get('statistics')
  async getStatistics(): Promise<{
    totalProductCustoms: number;
    totalInventories: number;
    productCustomsByStatus: { status: string; count: number }[];
    productCustomsByCategory: { categoryName: string; count: number }[];
  }> {
    return this.productCustomsService.getStatistics();
  }

  @Get('category/:productCategoryId')
  async findByProductCategoryId(
    @Param('productCategoryId', ParseUUIDPipe) productCategoryId: string,
  ): Promise<ProductCustomWithRelations[]> {
    return this.productCustomsService.findByProductCategoryId(
      productCategoryId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductCustomDto: UpdateProductCustomDto,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.update(id, updateProductCustomDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ): Promise<ProductCustomWithRelations> {
    return this.productCustomsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.productCustomsService.remove(id);
  }
}
