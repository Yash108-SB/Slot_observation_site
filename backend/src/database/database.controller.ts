import { Controller, Get, Param, Query } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('status')
  getStatus() {
    return this.databaseService.getStatus();
  }

  @Get('tables')
  getTables() {
    return this.databaseService.getTables();
  }

  @Get('tables/:name')
  getTableInfo(@Param('name') name: string) {
    return this.databaseService.getTableInfo(name);
  }

  @Get('sync/verify')
  verifyDataSync() {
    return this.databaseService.verifyDataSync();
  }

  @Get('sync/recent-changes')
  getRecentChanges(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.databaseService.getRecentChanges(parsedLimit);
  }

  @Get('counts/slot-masters')
  getSlotMastersCount() {
    return this.databaseService.getSlotMastersCount();
  }

  @Get('counts/daily-attendance')
  getDailyAttendanceCount(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    return this.databaseService.getDailyAttendanceCount(targetDate);
  }
}
