import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/shared/application/filters/global-exception.filter';
import { JwtAuthGuard } from '../src/shared/application/guards/jwt-auth.guard';

const server = express();
let isReady = false;

function translateMessages(errors: ValidationError[]): string[] {
  const msgs: string[] = [];
  for (const err of errors) {
    if (err.children?.length) { msgs.push(...translateMessages(err.children)); continue; }
    for (const constraint of Object.values(err.constraints ?? {})) {
      msgs.push(translateMsg(constraint, err.property));
    }
  }
  return msgs;
}

function translateMsg(msg: string, prop: string): string {
  if (msg.includes('should not exist')) return `El campo "${prop}" no está permitido`;
  if (msg.includes('must be a string')) return `"${prop}" debe ser texto`;
  if (msg.includes('should not be empty')) return `"${prop}" no puede estar vacío`;
  if (msg.includes('must be an email')) return `"${prop}" debe ser un email válido`;
  if (msg.includes('must be a number')) return `"${prop}" debe ser un número`;
  if (msg.includes('must be a boolean')) return `"${prop}" debe ser verdadero o falso`;
  if (msg.includes('must be an integer')) return `"${prop}" debe ser un número entero`;
  if (msg.includes('must be a UUID')) return `"${prop}" debe ser un ID válido`;
  if (msg.includes('must not be less than')) return `"${prop}" no puede ser menor que ${msg.match(/\d+/)?.[0]}`;
  if (msg.includes('must be longer than or equal')) return `"${prop}" debe tener al menos ${msg.match(/\d+/)?.[0]} caracteres`;
  if (msg.includes('Password must be at least')) return 'La contraseña debe tener al menos 8 caracteres';
  return msg;
}

async function bootstrap() {
  if (isReady) return;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { logger: false });

  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1');
  app.enableCors({
    origin: (process.env.FRONTEND_URL ?? '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => {
      const messages = translateMessages(errors);
      return new HttpException({ message: messages.join(' | '), errors: messages }, HttpStatus.BAD_REQUEST);
    },
  }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  await app.init();
  isReady = true;
}

export default async (req: express.Request, res: express.Response) => {
  await bootstrap();
  server(req, res);
};
