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
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { InformationsService } from './informations.service';
import { CreateInformationDto } from './dto/create-information.dto';
import { UpdateInformationDto } from './dto/update-information.dto';
import { GetInformationsQueryDto } from './dto/get-informations-query.dto';
import {
  InformationResponseDto,
  InformationListResponseDto,
} from './dto/information-response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { INFORMATION_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('informations')
@UseGuards(JwtGuard, PermissionGuard)
export class InformationsController {
  constructor(private readonly informationsService: InformationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(
    INFORMATION_PERMISSIONS.CREATE,
    INFORMATION_PERMISSIONS.MANAGE,
  )
  create(
    @Body(ValidationPipe) createInformationDto: CreateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationsService.create(createInformationDto);
  }

  @Public()
  @Get()
  findAll(
    @Query(ValidationPipe) query: GetInformationsQueryDto,
  ): Promise<InformationListResponseDto> {
    return this.informationsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InformationResponseDto> {
    return this.informationsService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(
    INFORMATION_PERMISSIONS.UPDATE,
    INFORMATION_PERMISSIONS.MANAGE,
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateInformationDto: UpdateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationsService.update(id, updateInformationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireAnyPermission(
    INFORMATION_PERMISSIONS.DELETE,
    INFORMATION_PERMISSIONS.MANAGE,
  )
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.informationsService.remove(id);
  }
}
