import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CallbackRequestDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+7 (918) 417-17-77' })
  @IsString()
  @IsNotEmpty()
  phone: string;
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  file?: string;
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

  @ApiProperty({ type: [Object] })
  items: Array<{ productId: number; productName: string; price: number; quantity: number }>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
