import { IsString, IsEmail, IsOptional, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CallbackRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  website?: string; // honeypot field

  @ApiProperty({ example: true })
  @IsNotEmpty()
  consent: boolean; // PD consent
}

export class ProductRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  website?: string; // honeypot field

  @ApiProperty({ example: true })
  @IsNotEmpty()
  consent: boolean; // PD consent
}

export class ServiceRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Стоматологическая установка' })
  @IsString()
  equipmentType: string;

  @ApiProperty({ example: 'Mercury' })
  @IsString()
  manufacturer: string;

  @ApiProperty({ example: 'M200' })
  @IsString()
  model: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ example: 'Не включается' })
  @IsString()
  problemDescription: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  website?: string; // honeypot field

  @ApiProperty({ example: true })
  @IsNotEmpty()
  consent: boolean; // PD consent
}

export class GeneralRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Вопрос о сотрудничестве' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  website?: string; // honeypot field

  @ApiProperty({ example: true })
  @IsNotEmpty()
  consent: boolean; // PD consent
}

export class CartItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 'Товар' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantity: number;
}

export class CartRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  website?: string; // honeypot field

  @ApiProperty({ example: true })
  @IsNotEmpty()
  consent: boolean; // PD consent
}

export class LeasingRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  website?: string; // honeypot field

  @ApiProperty({ example: true })
  @IsNotEmpty()
  consent: boolean; // PD consent
}

export class PriceInquiryRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  website?: string; // honeypot field

  @ApiProperty({ example: true })
  @IsNotEmpty()
  consent: boolean; // PD consent
}
