/**
 * Excepción base del dominio.
 * Todas las excepciones de negocio deben extender de aquí.
 * Esto permite distinguir errores de dominio de errores de infraestructura.
 */
export abstract class DomainException extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundException extends DomainException {
  readonly code = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier "${identifier}" not found`);
  }
}

export class BusinessRuleViolationException extends DomainException {
  readonly code = 'BUSINESS_RULE_VIOLATION';

  constructor(message: string) {
    super(message);
  }
}

export class InvalidValueObjectException extends DomainException {
  readonly code = 'INVALID_VALUE_OBJECT';

  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedDomainException extends DomainException {
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'Unauthorized operation') {
    super(message);
  }
}
