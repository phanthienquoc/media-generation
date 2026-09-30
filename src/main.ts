import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap(){
  const app=await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true}));
  app.useStaticAssets(join(process.cwd(),'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) res.type('application/javascript');
    },
  });
  await app.listen(Number(process.env.PORT??3000),'0.0.0.0');
}
bootstrap();
