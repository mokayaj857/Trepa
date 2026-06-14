import { buildGuardedWithdrawCall } from "./ptb_compiler.js";

/**
 * Assemble a final Move call descriptor for submission.
 * Replaces placeholders from the compiler with runtime values.
 */
export function assembleGuardedWithdrawTx(paymentPayload: any, opts: {
  treasuryObjectId: string,
  approvalReceipt: any,
  trepaPackageId: string,
  clockObjectId?: string,
  gasBudget?: number,
}) {
  const descriptor = buildGuardedWithdrawCall(paymentPayload);

  // Replace placeholders
  descriptor.packageObjectId = opts.trepaPackageId;
  descriptor.args[0] = opts.treasuryObjectId;
  descriptor.args[2] = opts.approvalReceipt;
  descriptor.args[6] = opts.clockObjectId || "0x0000000000000000000000000000000000000000";
  descriptor.gasBudget = opts.gasBudget ?? descriptor.gasBudget;

  // Normalize action_hash arg to byte array if it's hex string inside extensions
  // (already handled in compiler where action_hash was converted to bytes array)

  return descriptor;
}

export default { assembleGuardedWithdrawTx };
