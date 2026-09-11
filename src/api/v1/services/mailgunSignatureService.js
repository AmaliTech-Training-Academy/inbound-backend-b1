import crypto from "node:crypto"

const MAX_WEBHOOK_AGE_SECONDS = 5*60

export function verifyMailgunSignature({timestamp,token,signature,signingKey,now=Date.now()}){
    if (!timestamp || !token || !signature){
        return false
    }

    const timestampSeconds = Number(timestamp);

    if (!Number.isSafeInteger(timestampSeconds)){
        return false
    }

    if (Math.abs(Math.floor(now/1000) - timestampSeconds) > MAX_WEBHOOK_AGE_SECONDS) {
        return false
    }

    const expected = crypto
        .createHmac("SHA256", signingKey)
        .update(`${timestamp} ${token}`)
        .digest("hex");

    const received = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex")

    return received.length === expectedBuffer.length && crypto.timingSafeEqual(received, expectedBuffer)
}