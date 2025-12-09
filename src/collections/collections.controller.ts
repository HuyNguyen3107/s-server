import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionResponseDto } from './dto/collection-response.dto';

// Helper interface for consistent API responses
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Controller('collections')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<ApiResponse<CollectionResponseDto>> {
    const result = await this.collectionsService.create(createCollectionDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo bộ sưu tập thành công',
      data: result,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponse<CollectionResponseDto[]>> {
    const result = await this.collectionsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách bộ sưu tập thành công',
      data: result,
    };
  }

  @Get('hot')
  async findHotCollections(): Promise<ApiResponse<CollectionResponseDto[]>> {
    const result = await this.collectionsService.findHotCollections();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách bộ sưu tập hot thành công',
      data: result,
    };
  }

  @Get('route/:routeName')
  async findByRouteName(
    @Param('routeName') routeName: string,
  ): Promise<ApiResponse<CollectionResponseDto>> {
    const result = await this.collectionsService.findByRouteName(routeName);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bộ sưu tập thành công',
      data: result,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<CollectionResponseDto>> {
    const result = await this.collectionsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy bộ sưu tập thành công',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<ApiResponse<CollectionResponseDto>> {
    const result = await this.collectionsService.update(
      id,
      updateCollectionDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật bộ sưu tập thành công',
      data: result,
    };
  }

  @Patch(':id/toggle-status')
  async toggleStatus(
    @Param('id') id: string,
  ): Promise<ApiResponse<CollectionResponseDto>> {
    const result = await this.collectionsService.toggleStatus(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Thay đổi trạng thái bộ sưu tập thành công',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.collectionsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }
}
