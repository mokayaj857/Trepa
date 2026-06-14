import { digestUnbound, toHex } from "./action_hash.js";
// Lightweight Trepa scheme implementation that conforms to x402's SchemeNetworkClient shape.
export class TrepaScheme {
    constructor(policyId) {
        this.scheme = "trepa";
        this.nonceCounter = 1n;
        this.policyId = policyId;
    }
    async createPaymentPayload(x402Version, paymentRequirements, context) {
        const accepted = paymentRequirements;
        const actionType = "treasury_withdraw";
        const recipient = accepted.payTo || "0x0000000000000000000000000000000000000000";
        const amount = BigInt(accepted.amount || "0");
        const nonce = this.nonceCounter++;
        const expiresAtMs = BigInt(Date.now() + 1000 * 60 * 10);
        const actionHashBytes = digestUnbound(this.policyId, actionType, recipient, amount, nonce, expiresAtMs);
        const actionHashHex = toHex(actionHashBytes);
        const payload = {
            policy_id: this.policyId,
            action_type: actionType,
            recipient,
            amount: amount.toString(),
            nonce: nonce.toString(),
            expires_at_ms: expiresAtMs.toString(),
        };
        const extensions = {
            trepa: {
                action_hash: actionHashHex,
            },
        };
        return {
            x402Version,
            payload,
            extensions,
        };
    }
}
