import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('public-stats')
  async getPublicStatistics() {
    const stats = await this.appService.getPublicStatistics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thống kê công khai thành công',
      data: stats,
    };
  }
}
