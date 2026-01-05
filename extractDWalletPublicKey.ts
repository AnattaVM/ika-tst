#!/usr/bin/env node
import { keccak256 } from 'ethereum-cryptography/keccak';
import { Point } from 'noble-secp256k1';

function findPublicKey(obj: any): any {
  if (!obj || typeof obj !== 'object') return null;
  const keys = ['public_key', 'publicKey', 'pubkey', 'pub_key'];
  for (const k of keys) {
    if (k in obj) return obj[k];
  }
  for (const v of Object.values(obj)) {
    const found = findPublicKey(v);
    if (found) return found;
  }
  return null;
}

function toBytes(input: string | Uint8Array | Buffer): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (Buffer.isBuffer(input)) return new Uint8Array(input);
  const s = String(input).trim();
  if (s.startsWith('0x') || /^[0-9a-fA-F]+$/.test(s)) {
    const hex = s.startsWith('0x') ? s.slice(2) : s;
    return new Uint8Array(Buffer.from(hex, 'hex'));
  }
  // fallback to base64
  try {
    return new Uint8Array(Buffer.from(s, 'base64'));
  } catch (e) {
    throw new Error('Unsupported public_key encoding');
  }
}

function toHex(bytes: Uint8Array): string {
  return '0x' + Buffer.from(bytes).toString('hex');
}

function pubkeyToEthereumAddress(pubkeyBytes: Uint8Array): string {
  // Accept compressed (33), uncompressed with 0x04 prefix (65) or raw x+y (64)
  let uncompressed: Uint8Array;
  if (pubkeyBytes.length === 33) {
    // compressed -> decompress using noble-secp256k1
    const p = Point.fromHex(Buffer.from(pubkeyBytes).toString('hex'));
    const raw = p.toRawBytes(false); // 65 bytes, 0x04 prefix
    uncompressed = new Uint8Array(raw);
  } else if (pubkeyBytes.length === 65 && pubkeyBytes[0] === 0x04) {
    uncompressed = pubkeyBytes;
  } else if (pubkeyBytes.length === 64) {
    // add 0x04 prefix
    uncompressed = new Uint8Array(65);
    uncompressed[0] = 0x04;
    uncompressed.set(pubkeyBytes, 1);
  } else {
    throw new Error(`Unsupported public key length: ${pubkeyBytes.length}`);
  }

  // Ethereum address = keccak256(uncompressed_pubkey[1:])[12:]
  const hash = keccak256(uncompressed.slice(1));
  const addr = Buffer.from(hash).slice(-20).toString('hex');
  return '0x' + addr;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const arg = process.argv[2];
  let raw: string;
  if (!arg || arg === '-' ) {
    raw = await readStdin();
  } else {
    const fs = await import('fs');
    raw = fs.readFileSync(arg, 'utf8');
  }

  let obj: any;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    console.error('Input is not valid JSON');
    process.exit(2);
  }

  const pk = findPublicKey(obj);
  if (!pk) {
    console.error('public_key not found in provided DWallet object');
    process.exit(3);
  }

  let pkBytes: Uint8Array;
  try {
    pkBytes = toBytes(pk);
  } catch (e: any) {
    console.error('Failed to decode public_key:', e.message ?? e);
    process.exit(4);
  }

  try {
    const eth = pubkeyToEthereumAddress(pkBytes);
    console.log('public_key (hex):', toHex(pkBytes));
    console.log('ethereum_address:', eth);
  } catch (e: any) {
    console.error('Failed to compute Ethereum address:', e.message ?? e);
    process.exit(5);
  }
}

main().catch((e) => {
  console.error('Unhandled error:', e?.message ?? e);
  process.exit(1);
});
