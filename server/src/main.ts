import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // 设置全局前缀
  app.setGlobalPrefix('api');
  
  // 启用 CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 服务已启动: http://localhost:${port}`);
}
bootstrap();