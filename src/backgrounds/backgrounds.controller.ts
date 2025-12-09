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
} from '@nestjs/common';
import { BackgroundsService } from './backgrounds.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';
import { GetBackgroundsQueryDto } from './dto/get-backgrounds-query.dto';
import {
  BackgroundResponseDto,
  BackgroundListResponseDto,
} from './dto/background-response.dto';

@Controller('backgrounds')
export class BackgroundsController {
  constructor(private readonly backgroundsService: BackgroundsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) createBackgroundDto: CreateBackgroundDto,
  ): Promise<BackgroundResponseDto> {
    return this.backgroundsService.create(createBackgroundDto);
  }

  @Get()
  findAll(
    @Query(ValidationPipe) query: GetBackgroundsQueryDto,
  ): Promise<BackgroundListResponseDto> {
    return this.backgroundsService.findAll(query);
  }

  @Get('product/:productId')
  findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<BackgroundResponseDto[]> {
    return this.backgroundsService.findByProduct(productId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BackgroundResponseDto> {
    return this.backgroundsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateBackgroundDto: UpdateBackgroundDto,
  ): Promise<BackgroundResponseDto> {
    return this.backgroundsService.update(id, updateBackgroundDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.backgroundsService.remove(id);
  }
}
