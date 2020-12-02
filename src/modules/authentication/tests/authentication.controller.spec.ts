import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../authentication.controller';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationService } from '../authentication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../users/models/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { UserFactory } from '../../users/factory/user.factory';
import { mockedJwtService } from './mocks/jwt.service.mock';
import { mockedConfigService } from './mocks/config.service.mock';
import { UserRequest } from '../models/user-request.interface';
import { User } from '../../common/interfaces/user.interface';
import { LoginUserDto } from '../models/dto/login-user.dto';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({
          defaultStrategy: 'jwt',
          property: 'user',
          session: false,
        }),
      ],
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
        UsersService,
        UserFactory,
        AuthenticationService,
      ],
      controllers: [AuthenticationController],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the authenticated user', () => {
    const testRequest = {
      user: {
        email: 'test@test.de',
        password: 'test',
      },
    };
    const result = controller.authenticate(testRequest as UserRequest);
    expect(result).toBeDefined();
    expect(result.email).toBe(testRequest.user.email);
    expect(result.password).toBe(testRequest.user.password);
  });

  it('should return a user with matching credentials after register', async () => {
    const registerData = { email: 'test@test.de', password: 'testPassword' };
    const expectedResult: User = { creationDate: undefined, id: 0, role: undefined, ...registerData };
    jest.spyOn(service, 'register').mockResolvedValueOnce(expectedResult);
    expect(await controller.register(registerData)).toStrictEqual(expectedResult);
  });

  it('should return the JWT for the user', async () => {
    const testRequest: LoginUserDto = {
      email: 'test@test.de',
      plainTextPassword: 'test',
    };
    jest.spyOn(service, 'login').mockResolvedValueOnce('JWT_TOKEN');
    await expect(controller.login(testRequest)).resolves.toBe('JWT_TOKEN');
  });
});
