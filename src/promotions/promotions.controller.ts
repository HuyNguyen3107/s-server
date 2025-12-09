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
  ParseBoolPipe,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { PROMOTION_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('promotions')
@UseGuards(JwtGuard, PermissionGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireAnyPermission(
    PROMOTION_PERMISSIONS.CREATE,
    PROMOTION_PERMISSIONS.MANAGE,
  )
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo mã giảm giá thành công',
      data: await this.promotionsService.create(createPromotionDto),
    };
  }

  @Get()
  @RequireAnyPermission(
    PROMOTION_PERMISSIONS.LIST,
    PROMOTION_PERMISSIONS.VIEW,
    PROMOTION_PERMISSIONS.MANAGE,
  )
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const isActiveFilter =
      isActive !== undefined ? isActive === 'true' : undefined;

    const result = await this.promotionsService.findAll(
      pageNumber,
      limitNumber,
      isActiveFilter,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách mã giảm giá thành công',
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Public()
  @Get('active')
  async getActivePromotions() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách mã giảm giá đang hoạt động thành công',
      data: await this.promotionsService.getActivePromotions(),
    };
  }

  @Get('statistics')
  @RequireAnyPermission(
    PROMOTION_PERMISSIONS.VIEW,
    PROMOTION_PERMISSIONS.MANAGE,
  )
  async getStatistics() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thống kê mã giảm giá thành công',
      data: await this.promotionsService.getStatistics(),
    };
  }

  @Get(':id')
  @RequireAnyPermission(
    PROMOTION_PERMISSIONS.VIEW,
    PROMOTION_PERMISSIONS.MANAGE,
  )
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin mã giảm giá thành công',
      data: await this.promotionsService.findOne(id),
    };
  }

  @Public()
  @Get('code/:promoCode')
  async findByPromoCode(@Param('promoCode') promoCode: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin mã giảm giá thành công',
      data: await this.promotionsService.findByPromoCode(promoCode),
    };
  }

  @Public()
  @Post('validate')
  @UsePipes(new ValidationPipe({ transform: true }))
  async validatePromotion(@Body() validatePromotionDto: ValidatePromotionDto) {
    const result =
      await this.promotionsService.validatePromotion(validatePromotionDto);

    return {
      statusCode: result.isValid ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message: result.isValid
        ? 'Mã giảm giá hợp lệ'
        : 'Mã giảm giá không hợp lệ',
      data: result,
    };
  }

  @Public()
  @Post('apply/:promoCode')
  async applyPromotion(@Param('promoCode') promoCode: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Áp dụng mã giảm giá thành công',
      data: await this.promotionsService.applyPromotion(promoCode),
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireAnyPermission(
    PROMOTION_PERMISSIONS.UPDATE,
    PROMOTION_PERMISSIONS.MANAGE,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật mã giảm giá thành công',
      data: await this.promotionsService.update(id, updatePromotionDto),
    };
  }

  @Delete(':id')
  @RequireAnyPermission(
    PROMOTION_PERMISSIONS.DELETE,
    PROMOTION_PERMISSIONS.MANAGE,
  )
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.promotionsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}
