import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { UserFactory } from '../factory/user.factory';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserDtoFactory } from '../factory/user-dto.factory';

describe('User Service', () => {
  let service: UsersService;
  let repo: Repository<UserEntity>;
  let userFactory: UserFactory;
  let userDtoFactory: UserDtoFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFactory,
        UserDtoFactory,
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    userDtoFactory = module.get<UserDtoFactory>(UserDtoFactory);
    userFactory = module.get<UserFactory>(UserFactory);
    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(userFactory).toBeDefined();
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  it('should create user entity from email & password combination', () => {
    const mail = 'test@test.de';
    const password = 'testPassword';
    const user = userFactory.create(mail, password);
    expect(user).toBeDefined();
    expect(user.email).toStrictEqual(mail);
    expect(user.password).toStrictEqual(password);
  });

  it('findAll should return array of Users for findAll', async () => {
    const user = userFactory.create('test@user.de', 'testPassword') as UserEntity;
    jest.spyOn(repo, 'find').mockResolvedValueOnce([user]);
    expect(await service.findAll()).toEqual([user]);
  });

  it('findById should return User for id', async () => {
    const user = userFactory.create('test@user.de', 'testPassword') as UserEntity;
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(user);
    expect(await service.findById(1)).toEqual(user);
  });

  it('findById should throw BadRequestException on invalid type for userId', async () => {
    await expect(service.findById(null)).rejects.toThrow(BadRequestException);
    await expect(service.findById(<any>undefined)).rejects.toThrow(BadRequestException);
    await expect(service.findById(<any>'test')).rejects.toThrow(BadRequestException);
    await expect(service.findById(<any>{})).rejects.toThrow(BadRequestException);
    await expect(service.findById(<any>[])).rejects.toThrow(BadRequestException);
    await expect(
      service.findById(<any>(() => {
        return null;
      })),
    ).rejects.toThrow(BadRequestException);
  });

  it('findById should throw NotFoundException if no user was found', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.findById(-1)).rejects.toThrow(NotFoundException);
  });

  it('findByEmail should return User for email', async () => {
    const user = userFactory.create('test@user.de', 'testPassword') as UserEntity;
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(user);
    expect(await service.findByEmail(user.email)).toEqual(user);
  });

  it('findByEmail should throw BadRequestException on null value for email parameter', async () => {
    await expect(service.findByEmail(null)).rejects.toThrow(BadRequestException);
  });

  it('findOne should throw NotFoundException on null user when finding by e-mail', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.findByEmail('mail')).rejects.toThrow(NotFoundException);
  });

  it('deleteUser should return the deleted user', async () => {
    const user = userFactory.create('test@user.de', 'testPassword') as UserEntity;
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(user);
    jest.spyOn(repo, 'remove').mockResolvedValueOnce(user);
    await expect(service.deleteUser(0)).resolves.toStrictEqual(user);
  });

  it('deleteUser should throw BadRequestException on invalid type for id', async () => {
    await expect(service.deleteUser(null)).rejects.toThrow(BadRequestException);
    await expect(service.deleteUser(undefined)).rejects.toThrow(BadRequestException);
    await expect(service.deleteUser(<any>'test')).rejects.toThrow(BadRequestException);
    await expect(service.deleteUser(<any>{})).rejects.toThrow(BadRequestException);
    await expect(service.deleteUser(<any>[])).rejects.toThrow(BadRequestException);
    await expect(
      service.deleteUser(<any>(() => {
        return null;
      })),
    ).rejects.toThrow(BadRequestException);
  });

  it('deleteUser should throw NotFoundException on null user when removing ', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.deleteUser(-1)).rejects.toThrow(NotFoundException);
  });

  it('updateUser should update user properties', async () => {
    const user = userFactory.create('test@user.de', 'testPassword');
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(user);
    const updatedUser = userFactory.create('updated@user.de', 'updatedPassword');
    jest.spyOn(repo, 'save').mockResolvedValueOnce(updatedUser);
    const result = await service.updateUser(0, userDtoFactory.createFromUser(user));
    expect(result).toStrictEqual(updatedUser);
  });

  it('updateUser should throw BadRequestException on invalid id', async () => {
    await expect(service.updateUser(null, null)).rejects.toThrow(BadRequestException);
    await expect(service.updateUser(undefined, null)).rejects.toThrow(BadRequestException);
    await expect(service.updateUser(<any>'test', null)).rejects.toThrow(BadRequestException);
    await expect(service.updateUser(<any>{}, null)).rejects.toThrow(BadRequestException);
    await expect(service.updateUser(<any>[], null)).rejects.toThrow(BadRequestException);
    await expect(
      service.updateUser(
        <any>(() => {
          return null;
        }),
        null,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('updateUser should throw NotFoundException on null user when updating user', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    await expect(service.updateUser(-1, null)).rejects.toThrow(NotFoundException);
  });

  it('createUser should create user', async () => {
    const user = userFactory.create('test@user.de', 'testPassword') as UserEntity;
    jest.spyOn(repo, 'save').mockResolvedValueOnce(user);
    await expect(service.createUser(user)).resolves.toStrictEqual(user);
  });

  it('createUser should throw Error on null user at createUser', async () => {
    await expect(service.createUser(null)).rejects.toThrow();
  });
});
