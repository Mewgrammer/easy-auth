import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../models/dto/create-user.dto';
import { UserEntity } from '../models/user.entity';

@Injectable()
export class UserFactory {
  public createFromDto(data: CreateUserDto): UserEntity {
    return this.create(data.email, data.password);
  }

  public create(email: string, password: string): UserEntity {
    const user = new UserEntity();
    user.email = email;
    user.password = password;
    return user;
  }
}
