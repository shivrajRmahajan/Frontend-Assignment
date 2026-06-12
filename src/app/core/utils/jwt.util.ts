import { AuthUser, JwtPayload } from '../models/user.model';

/**
 * Mock JWT helpers.
 *
 * This is NOT a real, signed JWT — there is no backend to sign or verify one.
 * We mimic the three-segment `header.payload.signature` shape so the token
 * *looks* and *decodes* like the real thing (handy for explaining the flow),
 * but the signature is a constant placeholder. Never treat this as secure.
 */

const MOCK_SIGNATURE = 'mock-signature-unsigned-do-not-trust';

/** Token lifetime: 1 hour. Re-opening the tab within the hour keeps the session. */
const TOKEN_TTL_SECONDS = 60 * 60;

/** UTF-8-safe base64url encode (JWT segments are base64url, not base64). */
function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** UTF-8-safe base64url decode. */
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Build a mock JWT carrying the user's identity plus iat/exp time claims. */
export function createMockJwt(user: AuthUser, nowSeconds: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JwtPayload = {
    ...user,
    iat: nowSeconds,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
  };
  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    MOCK_SIGNATURE,
  ].join('.');
}

/** Decode + shape-check the payload segment. Returns null if malformed. */
export function decodeMockJwt(token: string): JwtPayload | null {
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }
  try {
    const payload = JSON.parse(base64UrlDecode(segments[1])) as JwtPayload;
    const valid =
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.exp === 'number';
    return valid ? payload : null;
  } catch {
    return null;
  }
}

/** True once the token's expiry has passed. */
export function isExpired(payload: JwtPayload, nowSeconds: number): boolean {
  return payload.exp <= nowSeconds;
}
