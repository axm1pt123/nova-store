import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BusinessRuleViolationException,
  DomainException,
  EntityNotFoundException,
  InvalidValueObjectException,
  UnauthorizedDomainException,
} from '@shared/domain/exceptions/domain.exceptions';

/**
 * Filtro global de excepciones.
 *
 * Mapea excepciones del dominio a códigos HTTP apropiados,
 * manteniendo el dominio limpio de dependencias HTTP.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, code } = this.resolveError(exception);

    this.logger.error(
      `[${request.method} ${request.url}] ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveError(exception: unknown): {
    status: number;
    message: string;
    code: string;
  } {
    if (exception instanceof EntityNotFoundException) {
      return { status: HttpStatus.NOT_FOUND, message: exception.message, code: exception.code };
    }
    if (exception instanceof UnauthorizedDomainException) {
      return { status: HttpStatus.UNAUTHORIZED, message: exception.message, code: exception.code };
    }
    if (
      exception instanceof BusinessRuleViolationException ||
      exception instanceof InvalidValueObjectException
    ) {
      return { status: HttpStatus.BAD_REQUEST, message: exception.message, code: exception.code };
    }
    if (exception instanceof DomainException) {
      return { status: HttpStatus.BAD_REQUEST, message: exception.message, code: exception.code };
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as { message?: string | string[] }).message || exception.message;
      return {
        status: exception.getStatus(),
        message: Array.isArray(message) ? message.join(', ') : String(message),
        code: 'HTTP_EXCEPTION',
      };
    }
    const errMsg = exception instanceof Error ? exception.message : '';
    if (errMsg.includes('Foreign key') || errMsg.includes('constraint failed') || errMsg.includes('violates foreign key')) {
      return { status: HttpStatus.CONFLICT, message: 'No se puede eliminar: el registro está siendo usado por otros datos', code: 'CONFLICT' };
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    };
  }
}
