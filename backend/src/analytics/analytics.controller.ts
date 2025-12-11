import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ===== NEW ATTENDANCE ANALYTICS ENDPOINTS =====
  @Get('attendance')
  getAttendanceStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getAttendanceStatistics(start, end);
  }

  @Get('attendance/slot/:slotMasterId')
  getSlotAttendanceHistory(
    @Param('slotMasterId') slotMasterId: string,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getSlotAttendanceHistory(slotMasterId, parsedDays);
  }

  @Get('attendance/filtered')
  getFilteredAttendanceAnalytics(
    @Query('subjectName') subjectName?: string,
    @Query('facultyName') facultyName?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    
    if (subjectName) filters.subjectName = subjectName;
    if (facultyName) filters.facultyName = facultyName;
    if (startTime) filters.startTime = startTime;
    if (endTime) filters.endTime = endTime;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.analyticsService.getFilteredAttendanceAnalytics(filters);
  }

  // ===== OLD ENDPOINTS (Backward compatibility) =====
  @Get('statistics')
  getStatistics() {
    return this.analyticsService.getStatistics();
  }

  @Get('recent')
  getRecentActivity(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getRecentActivity(parsedLimit);
  }

  @Get('sync/verify')
  verifyAnalyticsSync() {
    return this.analyticsService.verifyAnalyticsSync();
  }

  // ===== LOW ATTENDANCE ALERTS ENDPOINT =====
  @Get('alerts/low-attendance')
  getLowAttendanceAlerts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.analyticsService.getLowAttendanceAlerts(filters);
  }
}
