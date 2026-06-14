import assert from "assert";
import { digestUnbound, toHex } from "../ptb/action_hash.js";
function run() {
    console.log("Running PTB unit tests...");
    // Test vector 1: from src/test/example.ts
    const policyId1 = "0x07c365ac725cc6cca2846899d8b816860b47e5449af687e688c331b2c39be44c";
    const actionType1 = "treasury_withdraw";
    const recipient1 = "0x0000000000000000000000000000000000000001";
    const amount1 = 1000000n;
    const nonce1 = 1n;
    const expiresAtMs1 = 9999999999999n;
    const digest1 = digestUnbound(policyId1, actionType1, recipient1, amount1, nonce1, expiresAtMs1);
    const hex1 = toHex(digest1);
    const expected1 = "0x3c449c795a228a89a472e6282f64652f1ac87d0a15cb958e46e3e59e9a7607a0";
    assert.strictEqual(hex1, expected1, `digest mismatch test1: got ${hex1}`);
    // Test vector 2: from trepa_x402_demo (values differ due to timestamp; use deterministic nonce/time)
    const policyId2 = policyId1;
    const actionType2 = "treasury_withdraw";
    const recipient2 = "0x0000000000000000000000000000000000000001";
    const amount2 = 1000n;
    const nonce2 = 1n;
    const expiresAtMs2 = BigInt(1781431361039);
    const digest2 = digestUnbound(policyId2, actionType2, recipient2, amount2, nonce2, expiresAtMs2);
    const hex2 = toHex(digest2);
    const expected2 = "0xd2eb919a2097bb46d501b28c86d2d050e4f1595309220b1a23b3941c3f8ad9a9";
    assert.strictEqual(hex2, expected2, `digest mismatch test2: got ${hex2}`);
    console.log("All tests passed.");
}
try {
    run();
    process.exit(0);
}
catch (e) {
    console.error(e);
    process.exit(1);
}
