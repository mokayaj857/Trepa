// Minimal BCS-like helpers for PTB fields.
// NOTE: This is a lightweight serializer for common field types used by oxsecure action_hash.
// It aims to be compatible with the off-chain BCS encoding used by Move, but please verify against
// on-chain reference vectors. For full compatibility, use @mysten/bcs when available.

export function u64ToLE(value: bigint | number): Uint8Array {
  const v = BigInt(value);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setBigUint64(0, v, true); // little-endian
  return new Uint8Array(buf);
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 === 1) throw new Error("Invalid hex string");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

// LEB128 varuint for lengths (simple implementation)
export function encodeULEB128(n: number): Uint8Array {
  const out: number[] = [];
  let v = n >>> 0;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v & 0x7f);
  return new Uint8Array(out);
}

export function serializeBytesWithLen(b: Uint8Array): Uint8Array {
  const len = encodeULEB128(b.length);
  const out = new Uint8Array(len.length + b.length);
  out.set(len, 0);
  out.set(b, len.length);
  return out;
}
