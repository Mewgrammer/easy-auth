import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './models/dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDto } from './models/dto/user.dto';
import { RolesGuard } from '../authentication/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../authentication/jwt.guard';
import { UserRole } from '../common/interfaces/user.interface';
import { UserFactory } from './factory/user.factory';
import { UserDtoFactory } from './factory/user-dto.factory';

@ApiTags('users')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({
  strategy: 'excludeAll',
})
@Controller('api/users')
export class UsersController {
  constructor(private readonly _userService: UsersService, private readonly _userFactory: UserFactory, private readonly _userDtoFactory: UserDtoFactory) {}

  @Get()
  @Roles(UserRole.Administrator)
  public async getUsers(): Promise<UserDto[]> {
    return (await this._userService.findAll()).map(u => this._userDtoFactory.createFromUser(u));
  }

  @Get(':id')
  @Roles(UserRole.Administrator)
  public async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this._userDtoFactory.createFromUser(await this._userService.findById(id));
  }

  @Post()
  @Roles(UserRole.Administrator)
  public async createUser(@Body() userData: CreateUserDto): Promise<UserDto> {
    return this._userDtoFactory.createFromUser(await this._userService.createUser(userData));
  }

  @Put(':id')
  @Roles(UserRole.Administrator)
  public async updateUser(@Param('id', ParseIntPipe) id: number, @Body() userData: UserDto): Promise<UserDto> {
    return this._userDtoFactory.createFromUser(await this._userService.updateUser(id, userData));
  }

  @Delete(':id')
  @Roles(UserRole.Administrator)
  public async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this._userDtoFactory.createFromUser(await this._userService.deleteUser(id));
  }
}
