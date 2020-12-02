import { Request } from 'express';
import { User } from '../../common/interfaces/user.interface';

export interface UserRequest extends Request {
  user: User;
}
