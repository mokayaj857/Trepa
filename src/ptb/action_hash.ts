import { blake2b } from "blakejs";
import { u64ToLE, hexToBytes, serializeBytesWithLen } from "./bcs_helper.js";

/**
 * Build an "unbound" action hash similar to oxsecure::action_hash::digest_unbound.
 * Fields: policy_id (address hex), action_type (string), recipient (address hex), amount (u64), nonce (u64), expires_at_ms (u64)
 *
 * NOTE: This uses a minimal BCS-like serialization. Verify against Move reference vectors for production.
 */
export function digestUnbound(
  policyId: string,
  actionType: string,
  recipient: string,
  amount: bigint | number,
  nonce: bigint | number,
  expiresAtMs: bigint | number,
): Uint8Array {
  const parts: Uint8Array[] = [];

  // policy_id as raw bytes
  const policyBytes = hexToBytes(policyId);
  parts.push(serializeBytesWithLen(policyBytes));

  // action type as length-prefixed bytes
  const actionBytes = new TextEncoder().encode(actionType);
  parts.push(serializeBytesWithLen(actionBytes));

  // recipient bytes
  const recipBytes = hexToBytes(recipient);
  parts.push(serializeBytesWithLen(recipBytes));

  // amount, nonce, expires - each as u64 little-endian
  parts.push(u64ToLE(amount));
  parts.push(u64ToLE(nonce));
  parts.push(u64ToLE(expiresAtMs));

  // concat
  let totalLen = 0;
  for (const p of parts) totalLen += p.length;
  const buf = new Uint8Array(totalLen);
  let offset = 0;
  for (const p of parts) {
    buf.set(p, offset);
    offset += p.length;
  }

  // blake2b-256 digest
  const digest = blake2b(buf, undefined, 32);
  return new Uint8Array(digest);
}

export function toHex(bytes: Uint8Array): string {
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}
