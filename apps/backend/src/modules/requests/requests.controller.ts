import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import {
  CallbackRequestDto,
  ProductRequestDto,
  ServiceRequestDto,
  GeneralRequestDto,
  CartRequestDto,
} from './request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('callback')
  @ApiOperation({ summary: 'Submit callback request' })
  callback(@Body() dto: CallbackRequestDto) {
    return this.requestsService.create('callback', dto);
  }

  @Post('product')
  @ApiOperation({ summary: 'Submit product order request' })
  product(@Body() dto: ProductRequestDto) {
    return this.requestsService.create('product', dto);
  }

  @Post('service')
  @ApiOperation({ summary: 'Submit service request' })
  service(@Body() dto: ServiceRequestDto) {
    return this.requestsService.create('service', dto);
  }

  @Post('general')
  @ApiOperation({ summary: 'Submit general request' })
  general(@Body() dto: GeneralRequestDto) {
    return this.requestsService.create('general', dto);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Submit cart request' })
  cart(@Body() dto: CartRequestDto) {
    return this.requestsService.create('cart', dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all requests (admin)' })
  findAll() {
    return this.requestsService.findAll();
  }
}
