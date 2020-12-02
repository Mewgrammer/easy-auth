import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './models/dto/create-user.dto';
import { UserDto } from './models/dto/user.dto';
import { UserFactory } from './factory/user.factory';
import { User } from '../common/interfaces/user.interface';
import { UserEntity } from './models/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepo: Repository<UserEntity>,
    private readonly _userFactory: UserFactory,
  ) {}

  public async findAll(): Promise<User[]> {
    return await this._userRepo.find();
  }

  public async findById(id: number): Promise<User> {
    if (!UsersService.isValidId(id)) {
      throw new BadRequestException('id must be a number');
    }
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`user with id ${id} does not exist`);
    }
    return user;
  }

  public async findByEmail(email: string): Promise<User> {
    if (email == null) {
      throw new BadRequestException('email must be defined');
    }
    const user = await this._userRepo.findOne({ email });
    if (!user) {
      throw new NotFoundException(`user with email ${email} does not exist`);
    }
    return user;
  }

  public async updateUser(id: number, userData: UserDto): Promise<User> {
    if (!UsersService.isValidId(id)) {
      throw new BadRequestException('id must be a number');
    }
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`user with id ${id} does not exist`);
    }
    user.email = userData.email;
    user.password = userData.password;
    return await this._userRepo.save(user);
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (!userData) {
      throw new BadRequestException('userData cannot be null');
    }
    const createdUser = this._userFactory.createFromDto(userData);
    return await this.addUser(createdUser);
  }

  public async deleteUser(id: number): Promise<User> {
    if (!UsersService.isValidId(id)) {
      throw new BadRequestException('id must be a number');
    }
    const user = await this._userRepo.findOne(id);
    if (!user) {
      throw new NotFoundException(`user with id ${id} does not exist`);
    }
    return await this._userRepo.remove(user);
  }

  public async addUser(user: User): Promise<User> {
    return await this._userRepo.save(user);
  }

  private static isValidId(id: number) {
    return id != null && !isNaN(id) && typeof id === 'number';
  }
}
