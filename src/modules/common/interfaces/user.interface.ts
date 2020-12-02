export enum UserRole {
  User,
  Moderator,
  Administrator,
}

export interface User {
  id: number;
  email: string;
  password: string;
  creationDate: Date;
  role: UserRole;
}
