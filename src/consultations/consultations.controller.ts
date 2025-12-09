import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CONSULTATION_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public (no auth required)
export const Public = () => SetMetadata('isPublic', true);

@Controller('consultations')
@UseGuards(JwtGuard, PermissionGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async create(@Body() createConsultationDto: CreateConsultationDto) {
    const consultation = await this.consultationsService.create(
      createConsultationDto,
    );
    return {
      success: true,
      message: 'Đã gửi yêu cầu tư vấn thành công',
      data: consultation,
    };
  }

  @Get()
  @RequireAnyPermission(
    CONSULTATION_PERMISSIONS.LIST,
    CONSULTATION_PERMISSIONS.VIEW,
    CONSULTATION_PERMISSIONS.MANAGE,
  )
  async findAll() {
    const consultations = await this.consultationsService.findAll();
    return {
      success: true,
      data: consultations,
      total: consultations.length,
    };
  }

  @Get('my-consultations/:userId')
  @RequireAnyPermission(
    CONSULTATION_PERMISSIONS.VIEW,
    CONSULTATION_PERMISSIONS.MANAGE,
  )
  async findByAssignee(@Param('userId') userId: string) {
    const consultations =
      await this.consultationsService.findByAssignee(userId);
    return {
      success: true,
      data: consultations,
      total: consultations.length,
    };
  }

  @Get(':id')
  @RequireAnyPermission(
    CONSULTATION_PERMISSIONS.VIEW,
    CONSULTATION_PERMISSIONS.MANAGE,
  )
  async findOne(@Param('id') id: string) {
    const consultation = await this.consultationsService.findOne(id);
    if (!consultation) {
      return {
        success: false,
        message: 'Không tìm thấy yêu cầu tư vấn',
      };
    }
    return {
      success: true,
      data: consultation,
    };
  }

  @Patch(':id/status')
  @RequireAnyPermission(
    CONSULTATION_PERMISSIONS.UPDATE,
    CONSULTATION_PERMISSIONS.MANAGE,
  )
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const consultation = await this.consultationsService.updateStatus(
      id,
      body.status as any,
      body.notes,
    );
    if (!consultation) {
      return {
        success: false,
        message: 'Không tìm thấy yêu cầu tư vấn',
      };
    }
    return {
      success: true,
      message: 'Đã cập nhật trạng thái',
      data: consultation,
    };
  }

  @Patch(':id/assign')
  @RequireAnyPermission(
    CONSULTATION_PERMISSIONS.UPDATE,
    CONSULTATION_PERMISSIONS.MANAGE,
  )
  async assignToMe(
    @Param('id') id: string,
    @Body() body: { userId: string; userName: string },
  ) {
    const consultation = await this.consultationsService.assignToUser(
      id,
      body.userId,
      body.userName,
    );
    if (!consultation) {
      return {
        success: false,
        message: 'Không tìm thấy yêu cầu tư vấn',
      };
    }
    return {
      success: true,
      message: 'Đã nhận tư vấn thành công',
      data: consultation,
    };
  }

  @Delete(':id')
  @RequireAnyPermission(
    CONSULTATION_PERMISSIONS.DELETE,
    CONSULTATION_PERMISSIONS.MANAGE,
  )
  async remove(@Param('id') id: string) {
    const success = await this.consultationsService.remove(id);
    if (!success) {
      return {
        success: false,
        message: 'Không tìm thấy yêu cầu tư vấn',
      };
    }
    return {
      success: true,
      message: 'Đã xóa yêu cầu tư vấn',
    };
  }
}
