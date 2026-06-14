import { TransactionBlock } from "@mysten/sui.js";

/**
 * Build an unsigned Sui TransactionBlock from a Move call descriptor produced by the PTB compiler.
 * Returns the serialized BCS transaction bytes (Uint8Array).
 */
export async function buildUnsignedSuiTx(descriptor: any): Promise<Uint8Array> {
  const tx = new TransactionBlock();

  // Map args: we expect descriptor.args to be an array where object IDs are strings starting with 0x
  const tbArgs: any[] = descriptor.args.map((a: any) => {
    if (typeof a === "string" && a.startsWith("0x")) return tx.object(a);
    if (a instanceof Uint8Array) return tx.pure(Array.from(a));
    if (Array.isArray(a) && a.every((x) => typeof x === "number")) return tx.pure(a);
    if (typeof a === "string" && /^\d+$/.test(a)) return tx.pure(BigInt(a), "u64");
    return tx.pure(a);
  });

  const target = `${descriptor.packageObjectId}::${descriptor.module}::${descriptor.function}` as `${string}::${string}::${string}`;
  tx.moveCall({ target, arguments: tbArgs });

  // Ensure a sender is set so TransactionBlock.build can prepare the transaction
  const sender = descriptor.sender ?? "0x" + "0".repeat(64);
  try {
    // tx.setSender exists on TransactionBlock
    // @ts-ignore
    tx.setSender(sender);
  } catch (_) {
    // ignore if setSender not available in this SDK version
  }

  // Try to build offline without a provider by requesting only the transaction kind
  let built: Uint8Array;
  try {
    // @ts-ignore
    built = await tx.build({ onlyTransactionKind: true });
  } catch (e) {
    // Fallback to full build which may require a provider
    // @ts-ignore
    built = await tx.build();
  }
  return built as Uint8Array;
}


