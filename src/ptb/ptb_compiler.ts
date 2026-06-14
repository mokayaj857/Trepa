import { hexToBytes } from "./bcs_helper.js";

/**
 * Build a Move call descriptor for the trepa::guarded_withdraw function from an x402 PaymentPayload.
 * This returns a serializable description of the Move call (package, module, function, args) that
 * can be submitted with a Sui client or used to create an unsigned transaction for signing.
 */
export function buildGuardedWithdrawCall(paymentPayload: any) {
  // Expect the trepa extension to carry the action_hash (hex string)
  const extensions = paymentPayload.extensions || {};
  const trepaExt = extensions.trepa || {};
  const actionHashHex: string | undefined = trepaExt.action_hash;

  if (!actionHashHex) throw new Error("paymentPayload missing trepa.action_hash extension");

  const actionHashBytes = hexToBytes(actionHashHex);

  // Extract fields from payload.payload (TrepaScheme produced payload)
  const payload = paymentPayload.payload || {};
  const policyId: string = payload.policy_id;
  const recipient: string = payload.recipient;
  const amountStr: string = payload.amount || "0";

  // Build argument list in the expected Move call order.
  // Note: the real Sui SDK call will require proper object IDs and typed args; this is a descriptor.
  const args = [
    /* treasury object id */ "<TREASURY_OBJECT_ID>",
    /* policy object or policy id */ policyId,
    /* receipt (ApprovalReceipt) - to be provided by issuer */ "<APPROVAL_RECEIPT>",
    /* action_hash bytes */ Array.from(actionHashBytes),
    /* recipient address */ recipient,
    /* amount */ amountStr,
    /* clock (on-chain helper) */ "<SUI_CLOCK>",
  ];

  return {
    packageObjectId: "<TREPA_PACKAGE_ID>",
    module: "treasury",
    function: "guarded_withdraw",
    args,
    gasBudget: 10000,
  };
}

export default { buildGuardedWithdrawCall };
