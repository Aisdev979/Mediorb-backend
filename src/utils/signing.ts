import crypto from 'crypto';

let privateKey: crypto.KeyObject;
let publicKeyPem: string;

function loadOrGenerate(): void {
  const envPriv = process.env.HEALTHCARD_PRIVATE_KEY;
  const envPub = process.env.HEALTHCARD_PUBLIC_KEY;
  if (envPriv && envPub) {
    privateKey = crypto.createPrivateKey(envPriv.replace(/\\n/g, '\n'));
    publicKeyPem = envPub.replace(/\\n/g, '\n');
    return;
  }
  const pair = crypto.generateKeyPairSync('ed25519');
  privateKey = pair.privateKey;
  publicKeyPem = pair.publicKey.export({ type: 'spki', format: 'pem' }).toString();
  console.log('[health-card] No keys in env; generated an ephemeral Ed25519 keypair for this run.');
}
loadOrGenerate();

export function getPublicKeyPem(): string {
  return publicKeyPem;
}

// Signs the canonical JSON of the payload. The patient stores payload + signature
// (e.g. in a QR code) and any responder verifies it offline with the public key.
export function signPayload(payload: unknown): string {
  const data = Buffer.from(JSON.stringify(payload));
  return crypto.sign(null, data, privateKey).toString('base64');
}

export function verifyPayload(
  payload: unknown,
  signatureB64: string,
  publicKeyPemInput?: string,
): boolean {
  try {
    const data = Buffer.from(JSON.stringify(payload));
    const pub = crypto.createPublicKey(
      publicKeyPemInput ? publicKeyPemInput.replace(/\\n/g, '\n') : publicKeyPem,
    );
    return crypto.verify(null, data, pub, Buffer.from(signatureB64, 'base64'));
  } catch {
    return false;
  }
}
