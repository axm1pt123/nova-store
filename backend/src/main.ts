import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression');
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@shared/application/filters/global-exception.filter';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';

function translateMessages(errors: ValidationError[]): string[] {
  const msgs: string[] = [];
  for (const err of errors) {
    if (err.children?.length) { msgs.push(...translateMessages(err.children)); continue; }
    for (const constraint of Object.values(err.constraints ?? {})) {
      msgs.push(translate(constraint, err.property));
    }
  }
  return msgs;
}

function translate(msg: string, prop: string): string {
  if (msg.includes('should not exist')) return `El campo "${prop}" no está permitido`;
  if (msg.includes('must be a string')) return `"${prop}" debe ser texto`;
  if (msg.includes('should not be empty')) return `"${prop}" no puede estar vacío`;
  if (msg.includes('must be an email')) return `"${prop}" debe ser un email válido`;
  if (msg.includes('must be a number')) return `"${prop}" debe ser un número`;
  if (msg.includes('must be a boolean')) return `"${prop}" debe ser verdadero o falso`;
  if (msg.includes('must be an integer')) return `"${prop}" debe ser un número entero`;
  if (msg.includes('must not be less than')) return `"${prop}" no puede ser menor que ${msg.match(/\d+/)?.[0]}`;
  if (msg.includes('must not be greater than')) return `"${prop}" no puede ser mayor que ${msg.match(/\d+/)?.[0]}`;
  if (msg.includes('must be longer than or equal')) return `"${prop}" debe tener al menos ${msg.match(/\d+/)?.[0]} caracteres`;
  if (msg.includes('must be a UUID')) return `"${prop}" debe ser un ID válido`;
  if (msg.includes('Password must be at least')) return 'La contraseña debe tener al menos 8 caracteres';
  if (msg.includes('valid email')) return 'El email no es válido';
  return msg;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');
  const isProd = process.env.NODE_ENV === 'production';
  const apiPrefix = process.env.API_PREFIX ?? 'api/v1';

  app.setGlobalPrefix(apiPrefix);

  // Seguridad HTTP
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Compresión gzip
  app.use(compression());

  // CORS
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',');
  app.enableCors({
    origin: isProd ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const messages = translateMessages(errors);
        const { HttpException, HttpStatus } = require('@nestjs/common');
        return new HttpException({ message: messages.join(' | '), errors: messages }, HttpStatus.BAD_REQUEST);
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const port = parseInt(process.env.PORT ?? '3001', 10);

  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NOVA Store API')
      .setDescription('API REST del e-commerce NOVA Store — Clean Architecture con NestJS y Prisma')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('Auth & Usuarios', 'Registro, login y perfil de usuario')
      .addTag('Productos', 'Catálogo de productos')
      .addTag('Categorías', 'Categorías de productos')
      .addTag('Carrito', 'Gestión del carrito de compras')
      .addTag('Órdenes', 'Checkout y seguimiento de órdenes')
      .addTag('Pagos', 'Procesamiento de pagos')
      .addTag('Reportes', 'Reportes de ventas y métricas')
      .addTag('Upload', 'Subida de imágenes')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'NOVA Store — API Docs',
    });

    logger.log(`📚 Swagger disponible en http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Server running on http://0.0.0.0:${port}/${apiPrefix} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
}

bootstrap();
