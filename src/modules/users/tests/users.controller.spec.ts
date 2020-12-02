import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UserFactory } from '../factory/user.factory';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, CanActivate, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { RolesGuard } from '../../authentication/roles.guard';
import { JwtAuthGuard } from '../../authentication/jwt.guard';
import { UserDtoFactory } from '../factory/user-dto.factory';

describe('UserController', () => {
  let controller: UsersController;
  let userService: UsersService;
  let userFactory: UserFactory;
  let userDtoFactory: UserDtoFactory;

  beforeEach(async () => {
    const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidationPipe,
        ParseIntPipe,
        UserFactory,
        UserDtoFactory,
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
      controllers: [UsersController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();
    userDtoFactory = module.get<UserDtoFactory>(UserDtoFactory);
    userFactory = module.get<UserFactory>(UserFactory);
    userService = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getUsers should return list of userDto', async () => {
    const testUserEntity = new UserEntity();
    const testUserDto = userDtoFactory.createFromUser(testUserEntity);
    jest.spyOn(userService, 'findAll').mockResolvedValueOnce([testUserEntity]);
    expect(await controller.getUsers()).toStrictEqual([testUserDto]);
  });

  it('getUserById should return single userDto', async () => {
    const testUserEntity = userFactory.create('test@test.de', 'testPassword');
    const testUserDto = userDtoFactory.createFromUser(testUserEntity);
    jest.spyOn(userService, 'findById').mockResolvedValueOnce(testUserEntity);
    expect(await controller.getUserById(testUserDto.id)).toStrictEqual(testUserDto);
  });

  it('createUser should return userDto', async () => {
    const testUserEntity = userFactory.create('test@test.de', 'testPassword');
    const testUserDto = userDtoFactory.createFromUser(testUserEntity);
    jest.spyOn(userService, 'createUser').mockResolvedValueOnce(testUserEntity);
    expect(await controller.createUser(testUserDto)).toStrictEqual(testUserDto);
  });

  it('updateUser should return updated userDto', async () => {
    const testUserEntity = userFactory.create('test@test.de', 'testPassword');
    const testUserDto = userDtoFactory.createFromUser(testUserEntity);
    jest.spyOn(userService, 'updateUser').mockResolvedValueOnce(testUserEntity);
    expect(await controller.updateUser(0, testUserDto)).toStrictEqual(testUserDto);
  });

  it('getById should throw BadRequestException on invalid type for userId', async () => {
    await expect(controller.getUserById(null)).rejects.toThrow(BadRequestException);
    await expect(controller.getUserById(<any>'test')).rejects.toThrow(BadRequestException);
  });

  it('remove should return the deleted user', async () => {
    const testUserEntity = userFactory.create('test@test.de', 'testPassword');
    const testUserDto = userDtoFactory.createFromUser(testUserEntity);
    jest.spyOn(userService, 'deleteUser').mockResolvedValueOnce(testUserEntity);
    expect(await controller.deleteUser(0)).toStrictEqual(testUserDto);
  });
});
