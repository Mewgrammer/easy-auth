import { Injectable } from '@nestjs/common';
import { UserDto } from '../models/dto/user.dto';
import { User, UserRole } from '../../common/interfaces/user.interface';

@Injectable()
export class UserDtoFactory {
  public create(id: number, email: string, password: string, role: UserRole = UserRole.User): UserDto {
    const user = new UserDto();
    user.id = id;
    user.email = email;
    user.password = password;
    user.role = role;
    return user;
  }

  public createFromUser(user: User): UserDto {
    return this.create(user.id, user.email, user.password, user.role);
  }
}
