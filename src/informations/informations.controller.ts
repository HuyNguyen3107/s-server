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
import { InformationsService } from './informations.service';
import { CreateInformationDto } from './dto/create-information.dto';
import { UpdateInformationDto } from './dto/update-information.dto';
import { GetInformationsQueryDto } from './dto/get-informations-query.dto';
import {
  InformationResponseDto,
  InformationListResponseDto,
} from './dto/information-response.dto';

@Controller('informations')
export class InformationsController {
  constructor(private readonly informationsService: InformationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) createInformationDto: CreateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationsService.create(createInformationDto);
  }

  @Get()
  findAll(
    @Query(ValidationPipe) query: GetInformationsQueryDto,
  ): Promise<InformationListResponseDto> {
    return this.informationsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InformationResponseDto> {
    return this.informationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateInformationDto: UpdateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationsService.update(id, updateInformationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.informationsService.remove(id);
  }
}
