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
  UsePipes,
  ValidationPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { GetFeedbacksQueryDto } from './dto/get-feedbacks-query.dto';
import {
  FeedbackResponseDto,
  FeedbackListResponseDto,
} from './dto/feedback-response.dto';
import {
  JwtGuard,
  GetUser,
  UserPayload,
  PermissionGuard,
  RequireAnyPermission,
} from '../auth';
import { FEEDBACK_PERMISSIONS } from '../permissions/constants/permissions.constants';

// Custom decorator to mark routes as public
const Public = () => SetMetadata('isPublic', true);

@Controller('feedbacks')
@UseGuards(JwtGuard, PermissionGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Public()
  @Post()
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbacksService.create(createFeedbackDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: GetFeedbacksQueryDto,
  ): Promise<FeedbackListResponseDto> {
    return this.feedbacksService.findAll(query);
  }

  @Get('statistics')
  @RequireAnyPermission(FEEDBACK_PERMISSIONS.VIEW, FEEDBACK_PERMISSIONS.MANAGE)
  async getStatistics(@GetUser() user: UserPayload) {
    return this.feedbacksService.getStatistics();
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FeedbackResponseDto> {
    return this.feedbacksService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(
    FEEDBACK_PERMISSIONS.UPDATE,
    FEEDBACK_PERMISSIONS.RESPOND,
    FEEDBACK_PERMISSIONS.MANAGE,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @GetUser() user: UserPayload,
  ): Promise<FeedbackResponseDto> {
    return this.feedbacksService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @RequireAnyPermission(
    FEEDBACK_PERMISSIONS.DELETE,
    FEEDBACK_PERMISSIONS.MANAGE,
  )
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ): Promise<{ message: string }> {
    return this.feedbacksService.remove(id);
  }
}
