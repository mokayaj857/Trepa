/**
 * Lightweight x402-compatible fetch wrapper stub.
 * This file intentionally avoids depending on the full @x402 packages so it can be used
 * as a local integration shim. Replace with @x402/fetch when that package is available in your environment.
 */

export interface X402ClientLike {
  // parse PaymentRequired response -> PaymentRequired
  getPaymentRequiredResponse(getHeader: (name: string) => string | null, body?: any): any;
  // create a payment payload from PaymentRequired
  createPaymentPayload(paymentRequired: any): Promise<any>;
  // encode payment payload into headers
  encodePaymentSignatureHeader(paymentPayload: any): Record<string, string>;
  // optional hook for custom handling
  handlePaymentRequired?(paymentRequired: any): Promise<Record<string, string> | void>;
}

export function wrapFetchWithPaymentStub(fetchFn: typeof globalThis.fetch, client: X402ClientLike) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const clonedRequest = request.clone();

    const response = await fetchFn(request);
    if (response.status !== 402) return response;

    // parse payment requirements
    let paymentRequired: any;
    try {
      const getHeader = (name: string) => response.headers.get(name);
      let body: any | undefined;
      try {
        const text = await response.text();
        if (text) body = JSON.parse(text);
      } catch {
        // ignore
      }
      paymentRequired = client.getPaymentRequiredResponse(getHeader, body);
    } catch (e) {
      throw new Error(`Failed parsing payment requirements: ${e}`);
    }

    // optional hook
    if (client.handlePaymentRequired) {
      const hookHeaders = await client.handlePaymentRequired(paymentRequired);
      if (hookHeaders) {
        const hookReq = clonedRequest.clone();
        for (const [k, v] of Object.entries(hookHeaders)) hookReq.headers.set(k, v as string);
        const hookResp = await fetchFn(hookReq);
        if (hookResp.status !== 402) return hookResp;
      }
    }

    // create payment
    const paymentPayload = await client.createPaymentPayload(paymentRequired);
    const paymentHeaders = client.encodePaymentSignatureHeader(paymentPayload);

    for (const [k, v] of Object.entries(paymentHeaders)) clonedRequest.headers.set(k, v as string);
    clonedRequest.headers.set("Access-Control-Expose-Headers", "PAYMENT-RESPONSE,X-PAYMENT-RESPONSE");

    const secondResponse = await fetchFn(clonedRequest);
    return secondResponse;
  };
}
