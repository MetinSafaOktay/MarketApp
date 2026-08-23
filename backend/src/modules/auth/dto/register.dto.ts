import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ maxLength: 30 })
  @IsString()
  @MaxLength(30)
  profile_name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  first_name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  last_name: string;
}
