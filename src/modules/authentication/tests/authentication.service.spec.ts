import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../authentication.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../users/models/user.entity';
import { UserFactory } from '../../users/factory/user.factory';
import { UsersService } from '../../users/users.service';
import { Repository } from 'typeorm';
import { mockedJwtService } from './mocks/jwt.service.mock';
import { mockedConfigService } from './mocks/config.service.mock';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../models/jwt-payload.interface';
import { CreateUserDto } from '../../users/models/dto/create-user.dto';
import { LoginUserDto } from '../models/dto/login-user.dto';
import { UserRole } from '../../common/interfaces/user.interface';
import { PostgresErrorCode } from '../../database/models/postgres-error-codes.enum';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let userService: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        UserFactory,
        UsersService,
        AuthenticationService,
      ],
    }).compile();
    userFactory = module.get<UserFactory>(UserFactory);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('register should return userDto without password', async () => {
    const request: CreateUserDto = { email: 'test@test.de', password: 'password' };
    const userEntity = userFactory.create(request.email, request.password);
    jest.spyOn(userService, 'createUser').mockResolvedValueOnce(userEntity);
    const registerResult = await authService.register(request);
    expect(registerResult.password).toBeUndefined();
    expect(registerResult.email).toEqual(request.email);
  });

  it('register should throw BadRequestException on postgres UniqueViolation', async () => {
    const request: CreateUserDto = { email: 'test@test.de', password: 'password' };
    jest.spyOn(userService, 'createUser').mockRejectedValueOnce({
      code: PostgresErrorCode.UniqueViolation
    });
    await expect(authService.register(request)).rejects.toThrow(BadRequestException);
  });

  it('register should throw InternalServerErrorException createUser failure', async () => {
    const request: CreateUserDto = { email: 'test@test.de', password: 'password' };
    jest.spyOn(userService, 'createUser').mockRejectedValueOnce(null);
    await expect(authService.register(request)).rejects.toThrow(InternalServerErrorException);
  });

  it('register should throw BadRequestException on null userData', async () => {
    await expect(authService.register(null)).rejects.toThrow(BadRequestException);
  });

  it('login should return JWT', async () => {
    const request: LoginUserDto = { email: 'test@test.de', plainTextPassword: 'password' };
    const userEntity = userFactory.create(request.email, request.plainTextPassword);
    await userEntity.hashPassword(); // we need the password to be hashed for a successful login
    jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(userEntity);
    jest.spyOn(jwtService, 'sign').mockReturnValueOnce('JWT_TOKEN');
    await expect(authService.login(request)).resolves.toStrictEqual('JWT_TOKEN');
  });

  it('login should throw UnauthorizedException on non-hashed password', async () => {
    const request: LoginUserDto = { email: 'test@test.de', plainTextPassword: 'password' };
    const userEntity = userFactory.create(request.email, request.plainTextPassword);
    jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(userEntity);
    jest.spyOn(jwtService, 'sign').mockReturnValueOnce('JWT_TOKEN');
    await expect(authService.login(request)).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw UnauthorizedException on invalid credentials', async () => {
    const request: LoginUserDto = { email: 'test@test.de', plainTextPassword: 'password' };
    const userEntity = userFactory.create(request.email, request.plainTextPassword);
    request.plainTextPassword = 'some invalid password';
    jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(userEntity);
    jest.spyOn(jwtService, 'sign').mockReturnValueOnce('JWT_TOKEN');
    await expect(authService.login(request)).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw BadRequestException on null userData', async () => {
    await expect(authService.login(null)).rejects.toThrow(BadRequestException);
  });

  it('validateUser should return userDto', async () => {
    const request: JwtPayload = { userId: -1, role: UserRole.User };
    const userEntity = userFactory.create('test@test.de', 'testPassword');
    jest.spyOn(userService, 'findById').mockResolvedValueOnce(userEntity);
    await expect(authService.validateUser(request)).resolves.toStrictEqual(userEntity);
  });

  it('validateUser should throw BadRequestException on null userData', async () => {
    await expect(authService.validateUser(null)).rejects.toThrow(BadRequestException);
  });

  it('validateUser should throw UnauthorizedException when no user is found for JWT', async () => {
    jest.spyOn(userService, 'findById').mockResolvedValueOnce(null);
    await expect(authService.validateUser({
      userId: -1,
      role: UserRole.User
    })).rejects.toThrow(UnauthorizedException);
  });
});
