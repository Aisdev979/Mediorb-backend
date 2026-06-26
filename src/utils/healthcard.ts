import crypto from 'crypto';

// Ed25519 keypair for signing offline health cards.
// If HEALTHCARD_PRIVATE_KEY and HEALTHCARD_PUBLIC_KEY (PEM) are set in env they
// are used (stable across restarts). Otherwise a keypair is generated at first
// use, which is fine for a demo within one run. Loaded lazily so env is ready.
let keys: { priv: crypto.KeyObject; pub: crypto.KeyObject } | null = null;

function getKeys() {
  if (keys) return keys;
  const priv = process.env.HEALTHCARD_PRIVATE_KEY;
  const pub = process.env.HEALTHCARD_PUBLIC_KEY;
  if (priv && pub) {
    keys = { priv: crypto.createPrivateKey(priv), pub: crypto.createPublicKey(pub) };
  } else {
    const pair = crypto.generateKeyPairSync('ed25519');
    keys = { priv: pair.privateKey, pub: pair.publicKey };
  }
  return keys;
}

export function signPayload(payload: unknown): string {
  const data = Buffer.from(JSON.stringify(payload));
  return crypto.sign(null, data, getKeys().priv).toString('base64');
}

export function verifyPayload(payload: unknown, signatureB64: string): boolean {
  const data = Buffer.from(JSON.stringify(payload));
  const sig = Buffer.from(signatureB64, 'base64');
  return crypto.verify(null, data, getKeys().pub, sig);
}

export function getPublicKeyPem(): string {
  return getKeys().pub.export({ type: 'spki', format: 'pem' }).toString();
}
