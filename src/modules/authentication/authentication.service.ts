import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/models/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/models/postgres-error-codes.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './models/jwt-payload.interface';
import { LoginUserDto } from './models/dto/login-user.dto';
import { User } from '../common/interfaces/user.interface';

@Injectable()
export class AuthenticationService {
  constructor(private readonly _userService: UsersService, private readonly _jwtServices: JwtService, private readonly _configService: ConfigService) {}

  public async register(userData: CreateUserDto): Promise<User> {
    if (!userData) {
      throw new BadRequestException('no user data provided');
    }
    try {
      const createdUser = await this._userService.createUser(userData);
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists');
      }
      throw new InternalServerErrorException(error, 'An unexpected error occurred while processing the request');
    }
  }

  public async login(loginData: LoginUserDto): Promise<string> {
    if (!loginData) {
      throw new BadRequestException('no user data provided');
    }
    try {
      const user = await this._userService.findByEmail(loginData.email);
      await AuthenticationService.verifyPassword(loginData.plainTextPassword, user.password);
      const payload: JwtPayload = { userId: user.id, role: user.role };
      return this._jwtServices.sign(payload);
    } catch (error) {
      throw new UnauthorizedException('Wrong credentials provided');
    }
  }

  public async validateUser(payload: JwtPayload): Promise<User> {
    if (!payload) {
      throw new BadRequestException('invalid payload');
    }
    const user = await this._userService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }

  private static async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Wrong credentials provided');
    }
    return isPasswordMatching;
  }
}
