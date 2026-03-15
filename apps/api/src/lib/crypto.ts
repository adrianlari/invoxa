import crypto from "crypto";

const ALGO = "aes-256-gcm";

function key() {
  const hex = process.env.ENCRYPTION_KEY ?? "";
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) throw new Error("ENCRYPTION_KEY must be 32-byte hex");
  return buf;
}

export function encrypt(payload: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const data = Buffer.from(JSON.stringify(payload));
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt<T>(value: string): T {
  const raw = Buffer.from(value, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, key(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext) as T;
}
