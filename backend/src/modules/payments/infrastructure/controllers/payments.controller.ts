import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '@shared/application/decorators/current-user.decorator';
import { JwtAuthGuard } from '@shared/application/guards/jwt-auth.guard';
import { CreatePaymentDto } from '../../application/dtos/payment.dtos';
import {
  ConfirmPaymentUseCase,
  InitiatePaymentUseCase,
} from '../../application/use-cases/payment.use-cases';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly initiate: InitiatePaymentUseCase,
    private readonly confirm: ConfirmPaymentUseCase,
  ) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  start(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePaymentDto) {
    return this.initiate.execute(user.userId, dto);
  }

  @Post(':id/confirm')
  confirmPayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.confirm.execute(id);
  }
}
