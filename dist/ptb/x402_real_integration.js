import { x402Client } from "@x402/core/client";
export async function smokeTestX402() {
    const cfg = {
        schemes: [],
    };
    try {
        const client = x402Client.fromConfig(cfg);
        console.log("x402 client constructed:", typeof client);
        return true;
    }
    catch (e) {
        console.error("x402 client construction failed:", e);
        return false;
    }
}
// If run directly, execute smoke test
if (import.meta.url === `file://${process.argv[1]}`) {
    smokeTestX402().then(ok => process.exit(ok ? 0 : 1));
}
