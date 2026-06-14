import { serializeBytesWithLen, hexToBytes, u64ToLE, encodeULEB128 } from "./bcs_helper.js";

export interface ApprovalReceiptFields {
  policy_id: string; // hex
  action_hash: string; // hex
  action_type: string; // string
  issuer: string; // address hex
  protocol_object_id?: string | null; // optional
  recipient: string; // address hex
  amount: bigint | number;
  nonce: bigint | number;
  expires_at_ms: bigint | number;
}

/**
 * Serialize an ApprovalReceipt into a byte array using a canonical ordering.
 * This follows the field list described in 0xSecure docs. Uses simple length-prefixing
 * for variable-length fields and LE u64 for numeric fields.
 *
 * WARNING: This is a best-effort serializer for off-chain compatibility. Verify
 * against Move/oxsecure reference vectors for production.
 */
export function serializeApprovalReceipt(fields: ApprovalReceiptFields): Uint8Array {
  const parts: Uint8Array[] = [];

  // policy_id (bytes with length)
  parts.push(serializeBytesWithLen(hexToBytes(fields.policy_id)));

  // action_hash (bytes with length)
  parts.push(serializeBytesWithLen(hexToBytes(fields.action_hash)));

  // action_type (string with length)
  parts.push(serializeBytesWithLen(new TextEncoder().encode(fields.action_type)));

  // issuer (address bytes)
  parts.push(serializeBytesWithLen(hexToBytes(fields.issuer)));

  // protocol_object_id - optional: encode presence flag + bytes if present
  if (fields.protocol_object_id) {
    parts.push(new Uint8Array([1]));
    parts.push(serializeBytesWithLen(hexToBytes(fields.protocol_object_id)));
  } else {
    parts.push(new Uint8Array([0]));
  }

  // recipient
  parts.push(serializeBytesWithLen(hexToBytes(fields.recipient)));

  // amount, nonce, expires_at_ms as u64 LE
  parts.push(u64ToLE(fields.amount));
  parts.push(u64ToLE(fields.nonce));
  parts.push(u64ToLE(fields.expires_at_ms));

  // concat
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

export function toHex(bytes: Uint8Array): string {
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}
