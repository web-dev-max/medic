import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ContentAdminService } from './content-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/content')
export class AdminContentController {
  constructor(private contentAdminService: ContentAdminService) {}

  @Get()
  async findAll() {
    return this.contentAdminService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const page = await this.contentAdminService.findBySlug(slug);
    if (!page) {
      throw new Error('Content page not found');
    }
    return page;
  }

  @Post(':slug')
  async createOrUpdate(@Param('slug') slug: string, @Body() data: any, @Request() req: any) {
    return this.contentAdminService.createOrUpdate({
      slug,
      ...data,
    });
  }
}
