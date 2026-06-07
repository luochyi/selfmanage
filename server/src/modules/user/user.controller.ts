import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() body: { nickname?: string; avatar_url?: string },
  ) {
    const userId = req.user.userId;
    const updateData: any = {};
    if (body.nickname !== undefined) updateData.nickname = body.nickname;
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;

    const user = await this.userService.update(userId, updateData);
    return {
      code: 0,
      message: '更新成功',
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
      },
    };
  }
}
