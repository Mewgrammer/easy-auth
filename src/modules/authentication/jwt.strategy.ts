import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './models/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../common/interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly _authenticationService: AuthenticationService,
    private readonly _configService: ConfigService,
    private readonly _userService: UsersService,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: JwtPayload): Promise<User> {
    return await this._authenticationService.validateUser(payload);
  }
}
