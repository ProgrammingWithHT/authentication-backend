export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  isTwoFactorEnabled: boolean;
}
