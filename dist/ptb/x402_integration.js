/**
 * Lightweight x402-compatible fetch wrapper stub.
 * This file intentionally avoids depending on the full @x402 packages so it can be used
 * as a local integration shim. Replace with @x402/fetch when that package is available in your environment.
 */
export function wrapFetchWithPaymentStub(fetchFn, client) {
    return async (input, init) => {
        const request = new Request(input, init);
        const clonedRequest = request.clone();
        const response = await fetchFn(request);
        if (response.status !== 402)
            return response;
        // parse payment requirements
        let paymentRequired;
        try {
            const getHeader = (name) => response.headers.get(name);
            let body;
            try {
                const text = await response.text();
                if (text)
                    body = JSON.parse(text);
            }
            catch {
                // ignore
            }
            paymentRequired = client.getPaymentRequiredResponse(getHeader, body);
        }
        catch (e) {
            throw new Error(`Failed parsing payment requirements: ${e}`);
        }
        // optional hook
        if (client.handlePaymentRequired) {
            const hookHeaders = await client.handlePaymentRequired(paymentRequired);
            if (hookHeaders) {
                const hookReq = clonedRequest.clone();
                for (const [k, v] of Object.entries(hookHeaders))
                    hookReq.headers.set(k, v);
                const hookResp = await fetchFn(hookReq);
                if (hookResp.status !== 402)
                    return hookResp;
            }
        }
        // create payment
        const paymentPayload = await client.createPaymentPayload(paymentRequired);
        const paymentHeaders = client.encodePaymentSignatureHeader(paymentPayload);
        for (const [k, v] of Object.entries(paymentHeaders))
            clonedRequest.headers.set(k, v);
        clonedRequest.headers.set("Access-Control-Expose-Headers", "PAYMENT-RESPONSE,X-PAYMENT-RESPONSE");
        const secondResponse = await fetchFn(clonedRequest);
        return secondResponse;
    };
}
