import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateInformationDto } from './dto/create-information.dto';
import { UpdateInformationDto } from './dto/update-information.dto';
import { GetInformationsQueryDto } from './dto/get-informations-query.dto';
import {
  InformationResponseDto,
  InformationListResponseDto,
} from './dto/information-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InformationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createInformationDto: CreateInformationDto,
  ): Promise<InformationResponseDto> {
    try {
      const information = await this.prisma.information.create({
        data: {
          config: createInformationDto.config
            ? (JSON.parse(JSON.stringify(createInformationDto.config)) as any)
            : {},
        },
      });

      return this.mapToResponseDto(information);
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể tạo thông tin cấu hình mới',
      );
    }
  }

  async findAll(
    query: GetInformationsQueryDto,
  ): Promise<InformationListResponseDto> {
    try {
      const { page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.information.count();

      // Get informations with pagination
      const informations = await this.prisma.information.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: informations.map((information) =>
          this.mapToResponseDto(information),
        ),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể lấy danh sách thông tin cấu hình',
      );
    }
  }

  async findOne(id: string): Promise<InformationResponseDto> {
    try {
      const information = await this.prisma.information.findUnique({
        where: { id },
      });

      if (!information) {
        throw new NotFoundException(
          `Không tìm thấy thông tin cấu hình với ID: ${id}`,
        );
      }

      return this.mapToResponseDto(information);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể lấy thông tin cấu hình',
      );
    }
  }

  async update(
    id: string,
    updateInformationDto: UpdateInformationDto,
  ): Promise<InformationResponseDto> {
    try {
      // Kiểm tra information có tồn tại không
      const existingInformation = await this.prisma.information.findUnique({
        where: { id },
      });

      if (!existingInformation) {
        throw new NotFoundException(
          `Không tìm thấy thông tin cấu hình với ID: ${id}`,
        );
      }

      // Build update data object
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updateInformationDto.config !== undefined) {
        updateData.config = JSON.parse(
          JSON.stringify(updateInformationDto.config),
        );
      }

      // Update information
      const updatedInformation = await this.prisma.information.update({
        where: { id },
        data: updateData,
      });

      return this.mapToResponseDto(updatedInformation);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể cập nhật thông tin cấu hình',
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Kiểm tra information có tồn tại không
      const existingInformation = await this.prisma.information.findUnique({
        where: { id },
      });

      if (!existingInformation) {
        throw new NotFoundException(
          `Không tìm thấy thông tin cấu hình với ID: ${id}`,
        );
      }

      // Delete information
      await this.prisma.information.delete({
        where: { id },
      });

      return { message: 'Đã xóa thông tin cấu hình thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể xóa thông tin cấu hình',
      );
    }
  }

  private mapToResponseDto(information: any): InformationResponseDto {
    return {
      id: information.id,
      config: information.config,
      createdAt: information.createdAt,
      updatedAt: information.updatedAt,
    };
  }
}
