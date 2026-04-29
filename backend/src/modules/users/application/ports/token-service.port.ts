export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface TokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
}
