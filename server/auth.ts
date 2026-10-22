import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export const secretToken = () => randomBytes(24).toString('base64url');
export function safeEqual(a: string, b: string) { return timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b))); }
function signingSecret() {
  const secret=process.env.SESSION_SECRET;
  if(!secret || secret.length <32) throw new Error('Set SESSION_SECRET to at least 32 random characters in .env.local.');
  return secret;
}
export function adminSession() {
  const payload=Buffer.from(JSON.stringify({role:'admin',exp:Date.now()+8*3600000})).toString('base64url');
  return `${payload}.${createHmac('sha256',signingSecret()).update(payload).digest('base64url')}`;
}
export function isAdmin(token?: string) {
  if(!token) return false;
  const [payload,signature]=token.split('.');
  if(!payload || !signature) return false;
  try { return safeEqual(signature,createHmac('sha256',signingSecret()).update(payload).digest('base64url')) && JSON.parse(Buffer.from(payload,'base64url').toString()).exp > Date.now(); } catch { return false; }
}
export function requireAdmin(token?: string) { if(!isAdmin(token)) throw new Error('Administrator login required.'); }
