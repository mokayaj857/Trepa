import { x402Client } from "@x402/core/client";
import { x402HTTPClient } from "@x402/core/client";
import { TrepaScheme } from "../ptb/trepa_scheme.js";

async function main() {
  const client = x402Client.fromConfig({ schemes: [] });
  const policyId = "0x07c365ac725cc6cca2846899d8b816860b47e5449af687e688c331b2c39be44c";
  const scheme = new TrepaScheme(policyId);
  client.register("sui:devnet", scheme as any);

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
  } as any;

  const paymentPayload = await client.createPaymentPayload(paymentRequired as any);
  console.log("paymentPayload:", paymentPayload);

  const headers = httpClient.encodePaymentSignatureHeader(paymentPayload as any);
  console.log("encoded headers:", headers);
}

main().catch(e => { console.error(e); process.exit(1); });
