import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findByOpenid(openid: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { openid } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return await this.findById(id);
  }
}