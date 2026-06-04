import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { BodyPartModule } from './modules/body-part/body-part.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 数据库连接
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'fitness_tracker',
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true, // 开发环境下自动同步表结构
      logging: process.env.NODE_ENV === 'development',
    }),
    
    // 业务模块
    AuthModule,
    UserModule,
    WorkoutModule,
    ExerciseModule,
    BodyPartModule,
  ],
})
export class AppModule {}