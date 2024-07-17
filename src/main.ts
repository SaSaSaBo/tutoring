import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as config from 'config';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor() );

  app.use(cors());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Veri tipi degisimi yapabilmemiz icin aktif edildi.
      disableErrorMessages: false, // Hata mesajlarinda anlamli metin donmesini saglar
      whitelist: true, // Whitelist acmazsak asagidaki iki kurali kullanamayiz.
      forbidNonWhitelisted: true, //  Alttaki kurali yazmama izin veriyor
      forbidUnknownValues: true, // POST,GET,PATCH,DELETE bilinmeyten deger gelmesini engelller.
    }));

  await app.listen(config.port).then(()=>{
    console.log('NODE ENV: ', process.env.NODE_ENV);
    console.log('PORT:', config.port);
  });
}

bootstrap();