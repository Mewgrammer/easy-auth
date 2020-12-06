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
  
  /**
   * @return list of all users
   */
  public async findAll(): Promise<User[]> {
    return await this._userRepo.find();
  }
  
  /**
   * @param id - ID of the user
   * @return the user with ID
   * @throws BadRequestException id is not a number
   * @throws NotFoundException user with ID does not exist
   */
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
  
  /**
   * @param email - E-Mail address of the user
   * @return the user for the email
   * @throws BadRequestException email is null
   * @throws NotFoundException user with email does not exist
   */
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
  
  /**
   * @param id - the user ID
   * @param userData - the updated user data
   * @throws BadRequestException ID is not valid
   * @throws NotFoundException user with ID does not exist
   */
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
  
  /**
   * creates a new user
   * @param userData - the data for the user
   * @throws BadRequestException userData is null
   */
  public async createUser(userData: CreateUserDto): Promise<User> {
    if (!userData) {
      throw new BadRequestException('userData cannot be null');
    }
    const createdUser = this._userFactory.createFromDto(userData);
    return await this.addUser(createdUser);
  }
  
  /**
   * deletes a existing user
   * @param id - ID of the user to be deleted
   * @throws NotFoundException user with ID does not exist
   */
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
  
  /**
   * adds a user to the repository
   * @param user - the user to be added
   * @return the created user entity
   */
  public async addUser(user: User): Promise<User> {
    return await this._userRepo.save(user);
  }
  
  /**
   * checks whether the provided id is valid
   * @param id
   * @return whether the id is valid
   */
  private static isValidId(id: number) {
    return id != null && !isNaN(id) && typeof id === 'number';
  }
}
