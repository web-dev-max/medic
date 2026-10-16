import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('statistics')
  async getStatistics() {
    return this.dashboardService.getStatistics();
  }

  @Get('recent-requests')
  async getRecentRequests() {
    return this.dashboardService.getRecentRequests(20);
  }
}
