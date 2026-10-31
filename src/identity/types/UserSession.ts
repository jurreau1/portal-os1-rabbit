export interface UserSession {
  userId: string;
  authenticated: boolean;
  issuedAt: string;
  expiresAt?: string;
}
