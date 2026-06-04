import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fitness-tracker-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    
    return { userId: user.id, openid: user.openid };
  }
}