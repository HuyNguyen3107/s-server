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
import { BackgroundsService } from './backgrounds.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';
import { GetBackgroundsQueryDto } from './dto/get-backgrounds-query.dto';
import {
  BackgroundResponseDto,
  BackgroundListResponseDto,
} from './dto/background-response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { BACKGROUND_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('backgrounds')
@UseGuards(JwtGuard, PermissionGuard)
export class BackgroundsController {
  constructor(private readonly backgroundsService: BackgroundsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(
    BACKGROUND_PERMISSIONS.CREATE,
    BACKGROUND_PERMISSIONS.MANAGE,
  )
  create(
    @Body(ValidationPipe) createBackgroundDto: CreateBackgroundDto,
  ): Promise<BackgroundResponseDto> {
    return this.backgroundsService.create(createBackgroundDto);
  }

  @Public()
  @Get()
  findAll(
    @Query(ValidationPipe) query: GetBackgroundsQueryDto,
  ): Promise<BackgroundListResponseDto> {
    return this.backgroundsService.findAll(query);
  }

  @Public()
  @Get('product/:productId')
  findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<BackgroundResponseDto[]> {
    return this.backgroundsService.findByProduct(productId);
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BackgroundResponseDto> {
    return this.backgroundsService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(
    BACKGROUND_PERMISSIONS.UPDATE,
    BACKGROUND_PERMISSIONS.MANAGE,
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateBackgroundDto: UpdateBackgroundDto,
  ): Promise<BackgroundResponseDto> {
    return this.backgroundsService.update(id, updateBackgroundDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireAnyPermission(
    BACKGROUND_PERMISSIONS.DELETE,
    BACKGROUND_PERMISSIONS.MANAGE,
  )
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.backgroundsService.remove(id);
  }
}
