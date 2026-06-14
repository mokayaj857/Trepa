import { x402Client } from "@x402/core/client";
import { x402HTTPClient } from "@x402/core/client";
import { TrepaScheme } from "../ptb/trepa_scheme.js";
import { assembleGuardedWithdrawTx } from "../ptb/ptb_runtime.js";
async function main() {
    const client = x402Client.fromConfig({ schemes: [] });
    const policyId = "0x07c365ac725cc6cca2846899d8b816860b47e5449af687e688c331b2c39be44c";
    const scheme = new TrepaScheme(policyId);
    client.register("sui:devnet", scheme);
    const httpClient = new x402HTTPClient(client);
    const paymentRequired = {
        x402Version: 2,
        resource: { url: "https://api.trepa.local/data" },
        accepts: [
            {
                scheme: "trepa",
                network: "sui:devnet",
                asset: "USDC",
                amount: "1000",
                payTo: "0x0000000000000000000000000000000000000001",
                maxTimeoutSeconds: 600,
                extra: {},
            },
        ],
    };
    const paymentPayload = await client.createPaymentPayload(paymentRequired);
    console.log("paymentPayload built.\n");
    // Runtime values to assemble the final transaction
    // Build a serialized ApprovalReceipt for demonstration
    const { serializeApprovalReceipt, toHex: receiptHex } = await import("../ptb/approval_receipt.js");
    const trepaExt = paymentPayload.extensions?.trepa || {};
    const payloadData = paymentPayload.payload || {};
    const receiptBytes = serializeApprovalReceipt({
        policy_id: policyId,
        action_hash: trepaExt.action_hash || "0x00",
        action_type: "treasury_withdraw",
        issuer: "0x0",
        protocol_object_id: null,
        recipient: payloadData.recipient || "0x0",
        amount: BigInt(payloadData.amount || "0"),
        nonce: BigInt(payloadData.nonce || "0"),
        expires_at_ms: BigInt(payloadData.expires_at_ms || "0"),
    });
    const runtimeOpts = {
        treasuryObjectId: "0xTREASURYOBJECTID",
        approvalReceipt: receiptBytes,
        trepaPackageId: "0xTREPA_PACKAGE_ID",
        clockObjectId: "0x0000000000000000000000000000000000000000",
        gasBudget: 20000,
    };
    console.log("Serialized ApprovalReceipt (hex):", receiptHex(receiptBytes));
    const txDescriptor = assembleGuardedWithdrawTx(paymentPayload, runtimeOpts);
    // set a sender so the Sui SDK can build the tx
    txDescriptor.sender = "0x" + "0".repeat(64);
    console.log("Assembled Move call descriptor:\n", JSON.stringify(txDescriptor, null, 2));
    // Build unsigned Sui transaction bytes
    const { buildUnsignedSuiTx } = await import("../ptb/sui_tx_builder.js");
    const txBytes = await buildUnsignedSuiTx(txDescriptor);
    console.log("Unsigned transaction BCS (hex):", "0x" + Buffer.from(txBytes).toString("hex"));
}
main().catch(e => { console.error(e); process.exit(1); });
