import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFactory } from './factory/user.factory';
import { CommonModule } from '../common/common.module';
import { UserEntity } from './models/user.entity';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserDtoFactory } from './factory/user-dto.factory';

@Module({
  imports: [CommonModule, forwardRef(() => AuthenticationModule), TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, UserFactory, UserDtoFactory],
  exports: [UsersService, UserFactory, UserDtoFactory],
})
export class UsersModule {}
