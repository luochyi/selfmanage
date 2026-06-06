import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async wxLogin(code: string) {
    // 1. 用 code 换取 openid
    const wxResult = await this.code2Session(code);
    
    // 2. 查找或创建用户
    let user = await this.userService.findByOpenid(wxResult.openid);
    
    if (!user) {
      user = await this.userService.create({
        openid: wxResult.openid,
        nickname: `用户${wxResult.openid.slice(-6)}`,
      });
    }
    
    // 3. 生成 JWT token
    const payload = { sub: user.id, openid: user.openid };
    const token = this.jwtService.sign(payload);
    
    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
      },
    };
  }

  // 开发环境模拟登录（固定使用同一个用户）
  async devLogin() {
    const devOpenid = 'dev_user_test';
    
    // 查找或创建开发用户
    let user = await this.userService.findByOpenid(devOpenid);
    
    if (!user) {
      user = await this.userService.create({
        openid: devOpenid,
        nickname: '开发测试用户',
      });
    }
    
    // 生成 JWT token
    const payload = { sub: user.id, openid: user.openid };
    const token = this.jwtService.sign(payload);
    
    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
      },
    };
  }

  private async code2Session(code: string) {
    const appid = process.env.WX_APPID || 'your-appid';
    const secret = process.env.WX_SECRET || 'your-secret';
    
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.errcode) {
        throw new Error(data.errmsg);
      }
      
      return {
        openid: data.openid,
        session_key: data.session_key,
      };
    } catch (error) {
      throw new UnauthorizedException('微信登录失败: ' + error.message);
    }
  }
}