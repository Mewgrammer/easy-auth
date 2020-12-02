import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  public password: string;
}
