import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { CommonModule } from '../common/common.module';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    forwardRef(() => UsersModule),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`,
        },
      }),
    }),
  ],
  providers: [AuthenticationService, JwtStrategy, RolesGuard, JwtAuthGuard],
  controllers: [AuthenticationController],
  exports: [AuthenticationService, RolesGuard, JwtStrategy, JwtAuthGuard],
})
export class AuthenticationModule {}
