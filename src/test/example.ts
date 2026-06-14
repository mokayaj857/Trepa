import { digestUnbound, toHex } from "../ptb/index.js";

async function main() {
  const policyId = "0x07c365ac725cc6cca2846899d8b816860b47e5449af687e688c331b2c39be44c";
  const actionType = "treasury_withdraw";
  const recipient = "0x0000000000000000000000000000000000000001";
  const amount = 1_000_000n;
  const nonce = 1n;
  const expiresAtMs = 9999999999999n;

  const digest = digestUnbound(policyId, actionType, recipient, amount, nonce, expiresAtMs);
  console.log("digest (hex):", toHex(digest));
}

main().catch(e => { console.error(e); process.exit(1); });
