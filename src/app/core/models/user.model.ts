/** The two roles the app gates access on. */
export type Role = 'admin' | 'user';

/**
 * A record in the mock user store (`core/data/users.seed.ts`).
 * Passwords are never stored in plain text — only their SHA-256 hex digest,
 * so a leak of this "table" never exposes a usable credential.
 */
export interface SeedUser {
  email: string;
  name: string;
  role: Role;
  /** Lowercase hex SHA-256 digest of the password. */
  passwordHash: string;
}

/**
 * The authenticated user as exposed to the rest of the app.
 * Deliberately omits the password hash — UI code never sees credentials.
 */
export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}

/** Decoded payload of our mock JWT (identity + standard time claims). */
export interface JwtPayload extends AuthUser {
  /** Issued-at, epoch seconds. */
  iat: number;
  /** Expiry, epoch seconds. */
  exp: number;
}

/** Raw login form input. */
export interface LoginCredentials {
  email: string;
  password: string;
}
