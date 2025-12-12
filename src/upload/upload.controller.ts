import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadResponse } from '../cloudinary/cloudinary.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { UPLOAD_PERMISSIONS } from '../permissions/constants/permissions.constants';

@Controller('upload')
@UseGuards(JwtGuard, PermissionGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @RequireAnyPermission(UPLOAD_PERMISSIONS.CREATE, UPLOAD_PERMISSIONS.MANAGE)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size should not exceed 5MB');
    }

    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return {
        success: true,
        message: 'Image uploaded successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @RequireAnyPermission(UPLOAD_PERMISSIONS.CREATE, UPLOAD_PERMISSIONS.MANAGE)
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponse> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Validate each file
    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size should not exceed 5MB');
      }
    }

    try {
      const results = await this.cloudinaryService.uploadMultipleImages(files);
      return {
        success: true,
        message: `${files.length} images uploaded successfully`,
        data: results,
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  @Delete('image/:publicId')
  @RequireAnyPermission(UPLOAD_PERMISSIONS.DELETE, UPLOAD_PERMISSIONS.MANAGE)
  async deleteImage(
    @Param('publicId') publicId: string,
  ): Promise<UploadResponse> {
    try {
      await this.cloudinaryService.deleteImage(publicId);
      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }
}
