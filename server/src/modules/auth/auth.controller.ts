import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('wx-login')
  async wxLogin(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('微信登录code不能为空');
    }
    
    try {
      const result = await this.authService.wxLogin(code);
      return {
        code: 0,
        message: '登录成功',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException('微信登录失败: ' + error.message);
    }
  }

  // 开发环境模拟登录
  @Get('dev-login')
  async devLogin() {
    try {
      const result = await this.authService.devLogin();
      return {
        code: 0,
        message: '登录成功',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException('登录失败: ' + error.message);
    }
  }
}