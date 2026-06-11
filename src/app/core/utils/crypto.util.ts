/**
 * SHA-256 hashing built on the Web Crypto API (`crypto.subtle`).
 *
 * Returns the lowercase hex digest — the exact format stored in the seed user
 * store — so login can hash the typed password and compare digests without ever
 * handling a stored plain-text password.
 *
 * Note: `crypto.subtle` is only available in a secure context. `ng serve` runs
 * on `http://localhost`, which browsers treat as secure, so this works in dev
 * (and over HTTPS in prod). It would be `undefined` on a plain-HTTP origin.
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
