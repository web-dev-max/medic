import { Controller, Post, Body, Get, UseGuards, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import {
  CallbackRequestDto,
  ProductRequestDto,
  ServiceRequestDto,
  GeneralRequestDto,
  CartRequestDto,
  LeasingRequestDto,
  PriceInquiryRequestDto,
} from './request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Express } from 'express';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  private getClientIp(req: any): string {
    return req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.connection?.remoteAddress || 'unknown';
  }

  @Post('callback')
  @ApiOperation({ summary: 'Submit callback request' })
  callback(@Body() dto: CallbackRequestDto, @Req() req: any) {
    const ip = this.getClientIp(req);
    return this.requestsService.create('callback', dto, ip);
  }

  @Post('product')
  @ApiOperation({ summary: 'Submit product order request' })
  product(@Body() dto: ProductRequestDto, @Req() req: any) {
    const ip = this.getClientIp(req);
    return this.requestsService.create('product', dto, ip);
  }

  @Post('service')
  @ApiOperation({ summary: 'Submit service request' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('photos', 5))
  service(
    @Body() dto: ServiceRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const ip = this.getClientIp(req);

    // Attach uploaded files for email
    if (files && files.length > 0) {
      (dto as any)._attachments = files.map((file) => ({
        filename: file.originalname,
        path: file.path,
        contentType: file.mimetype,
      }));
    }

    return this.requestsService.create('service', dto, ip);
  }

  @Post('general')
  @ApiOperation({ summary: 'Submit general request' })
  general(@Body() dto: GeneralRequestDto, @Req() req: any) {
    const ip = this.getClientIp(req);
    return this.requestsService.create('general', dto, ip);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Submit cart request' })
  cart(@Body() dto: CartRequestDto, @Req() req: any) {
    const ip = this.getClientIp(req);
    return this.requestsService.create('cart', dto, ip);
  }

  @Post('leasing')
  @ApiOperation({ summary: 'Submit leasing request' })
  leasing(@Body() dto: LeasingRequestDto, @Req() req: any) {
    const ip = this.getClientIp(req);
    return this.requestsService.create('leasing', dto, ip);
  }

  @Post('price-inquiry')
  @ApiOperation({ summary: 'Submit price inquiry request' })
  priceInquiry(@Body() dto: PriceInquiryRequestDto, @Req() req: any) {
    const ip = this.getClientIp(req);
    return this.requestsService.create('price-inquiry', dto, ip);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all requests (admin)' })
  findAll() {
    return this.requestsService.findAll();
  }
}
