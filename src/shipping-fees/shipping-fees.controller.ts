import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ShippingFeesService } from './shipping-fees.service';
import { CreateShippingFeeDto } from './dto/create-shipping-fee.dto';
import { UpdateShippingFeeDto } from './dto/update-shipping-fee.dto';
import { FilterShippingFeeDto } from './dto/filter-shipping-fee.dto';
import {
  ShippingFeeResponseDto,
  PaginatedShippingFeesResponseDto,
} from './dto/shipping-fee-response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { SHIPPING_FEE_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('shipping-fees')
@UseGuards(JwtGuard, PermissionGuard)
export class ShippingFeesController {
  constructor(private readonly shippingFeesService: ShippingFeesService) {}

  @Post()
  @RequireAnyPermission(
    SHIPPING_FEE_PERMISSIONS.CREATE,
    SHIPPING_FEE_PERMISSIONS.MANAGE,
  )
  async create(@Body() createShippingFeeDto: CreateShippingFeeDto) {
    const result = await this.shippingFeesService.create(createShippingFeeDto);

    return {
      statusCode: result.isUpdated ? HttpStatus.OK : HttpStatus.CREATED,
      message: result.isUpdated
        ? 'Đã cập nhật phí vận chuyển hiện có cho loại vận chuyển và khu vực này'
        : 'Tạo phí vận chuyển mới thành công',
      data: result.data,
    };
  }

  @Public()
  @Get()
  async findAll(@Query() filterDto: FilterShippingFeeDto) {
    const result = await this.shippingFeesService.findAll(filterDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách phí vận chuyển thành công',
      data: result,
    };
  }

  @Public()
  @Get('areas')
  async getDistinctAreas() {
    const result = await this.shippingFeesService.getDistinctAreas();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách khu vực thành công',
      data: result,
    };
  }

  @Public()
  @Get('shipping-types')
  async getDistinctShippingTypes() {
    const result = await this.shippingFeesService.getDistinctShippingTypes();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách loại vận chuyển thành công',
      data: result,
    };
  }

  @Get('statistics')
  @RequireAnyPermission(
    SHIPPING_FEE_PERMISSIONS.VIEW,
    SHIPPING_FEE_PERMISSIONS.MANAGE,
  )
  async getStatistics() {
    const result = await this.shippingFeesService.getStatistics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thống kê phí vận chuyển thành công',
      data: result,
    };
  }

  @Public()
  @Get('by-area/:area')
  async getShippingFeesByArea(@Param('area') area: string) {
    const result = await this.shippingFeesService.getShippingFeesByArea(area);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy phí vận chuyển theo khu vực thành công',
      data: result,
    };
  }

  @Public()
  @Get('search')
  async findByAreaAndType(
    @Query('area') area: string,
    @Query('shippingType') shippingType: string,
  ) {
    const result = await this.shippingFeesService.findByAreaAndType(
      area,
      shippingType,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Tìm kiếm phí vận chuyển thành công',
      data: result,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.shippingFeesService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin phí vận chuyển thành công',
      data: result,
    };
  }

  @Patch(':id')
  @RequireAnyPermission(
    SHIPPING_FEE_PERMISSIONS.UPDATE,
    SHIPPING_FEE_PERMISSIONS.MANAGE,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShippingFeeDto: UpdateShippingFeeDto,
  ) {
    const result = await this.shippingFeesService.update(
      id,
      updateShippingFeeDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật phí vận chuyển thành công',
      data: result,
    };
  }

  @Delete(':id')
  @RequireAnyPermission(
    SHIPPING_FEE_PERMISSIONS.DELETE,
    SHIPPING_FEE_PERMISSIONS.MANAGE,
  )
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.shippingFeesService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: null,
    };
  }
}
