import { x402Client } from "@x402/core/client";
import type { x402ClientConfig } from "@x402/core/client";

export async function smokeTestX402() {
  const cfg: Partial<x402ClientConfig> = {
    schemes: [],
  } as any;

  try {
    const client = x402Client.fromConfig(cfg as x402ClientConfig);
    console.log("x402 client constructed:", typeof client);
    return true;
  } catch (e) {
    console.error("x402 client construction failed:", e);
    return false;
  }
}

// If run directly, execute smoke test
if (import.meta.url === `file://${process.argv[1]}`) {
  smokeTestX402().then(ok => process.exit(ok ? 0 : 1));
}
