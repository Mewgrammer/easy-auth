import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { UserRole } from '../../../common/interfaces/user.interface';

export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Expose()
  public id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public password: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  public joinDate: Date;

  @ApiProperty()
  @IsEnum(UserRole)
  @IsNotEmpty()
  @Expose()
  public role: UserRole;
}
