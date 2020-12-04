import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, Post, Req, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from '../users/models/dto/create-user.dto';
import { UserRequest } from './models/user-request.interface';
import { JwtAuthGuard } from './jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './models/dto/login-user.dto';

@ApiTags('authentication')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  strategy: 'excludeAll',
})
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly _authService: AuthenticationService) {}
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  public authenticate(@Req() request: UserRequest) {
    return request.user;
  }

  @Post('register')
  public async register(@Body() registrationData: CreateUserDto) {
    return this._authService.register(registrationData);
  }

  @HttpCode(200)
  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto) {
    return await this._authService.login(loginUserDto);
  }
}
