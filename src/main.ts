import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration:
  // - If CORS_ORIGIN is set, only allow that specific origin
  // - If CORS_ORIGIN is not set, allow all origins (for development/flexibility)
  // - Always allow requests without origin header (e.g. curl, native apps)
  const allowedOrigin = process.env.CORS_ORIGIN;

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests without origin header (curl, Postman, native apps)
      if (!origin) return callback(null, true);

      // If CORS_ORIGIN is not set, allow all origins
      if (!allowedOrigin) return callback(null, true);

      // If CORS_ORIGIN is set, only allow that specific origin
      if (origin === allowedOrigin) return callback(null, true);

      // Reject all other origins
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  // Enable global validation pipe with transform
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: false, // Đổi thành false để không strict quá
      skipMissingProperties: false,
    }),
  );

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
