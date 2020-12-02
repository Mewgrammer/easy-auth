import { UserRole } from '../../common/interfaces/user.interface';

export interface JwtPayload {
  userId: number;
  role: UserRole;
}
