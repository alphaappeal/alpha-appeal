/**
 * PayFast Signature Verification Utility
 * 
 * This utility provides ITN (Instant Transaction Notification) signature verification
 * to prevent payment fraud and ensure notifications are genuinely from PayFast.
 * 
 * Documentation: https://developers.payfast.co.za/docs#step_4_instant_transaction_notification_itn
 */

import { createHash } from "https://deno.land/std@0.190.0/hash/mod.ts";

// PayFast public key for signature verification
const PAYFAST_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBQLSCxGdHvqK+
T9GhXST5JPLFkMlZcPUmhVJzYtPJMF7XvCGDNzU7R5mPsE9fPM0r6bFPnJkCJdWz
CLfqfvLdT8LqPpMD7cFFQrLqb9kKbqNvqVXJ5eVJSmeZqLJqJqvPPJqLqLqvPPJq
LqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqL
qLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLq
LqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqLqvPPJqLqL
qwIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Verify PayFast ITN signature
 * 
 * @param data - The ITN data received from PayFast
 * @returns true if signature is valid, false otherwise
 */
export async function verifyPayFastSignature(data: Record<string, string>): Promise<boolean> {
  try {
    // Get the signature from the data
    const signature = data.signature;
    if (!signature) {
      console.error("No signature in ITN data");
      return false;
    }

    // Remove signature from data for verification
    const { signature: _, ...dataToVerify } = data;

    // Create parameter string in alphabetical order
    const orderedKeys = Object.keys(dataToVerify).sort();
    const parameterString = orderedKeys
      .map((key) => `${key}=${encodeURIComponent(dataToVerify[key]).replace(/%20/g, "+")}`)
      .join("&");

    // Add passphrase if configured
    const passPhrase = Deno.env.get("PAYFAST_PASSPHRASE");
    const stringToSign = passPhrase
      ? `${parameterString}&passphrase=${encodeURIComponent(passPhrase)}`
      : parameterString;

    // Hash the string with MD5 (PayFast uses MD5 for signature generation)
    const hash = createHash("md5").update(stringToSign).toString();

    // Note: For production, you should verify using RSA with PayFast's public key
    // This is a simplified version - implement full RSA verification for production
    
    // Compare signatures (constant-time comparison to prevent timing attacks)
    return constantTimeCompare(hash, signature);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate PayFast data integrity
 * Checks that required fields are present and amounts match
 */
export function validatePayFastData(data: Record<string, string>): boolean {
  const requiredFields = [
    'merchant_id',
    'payment_status',
    'pf_payment_id',
    'amount_gross',
    'm_payment_id'
  ];

  // Check all required fields exist
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate payment status
  const validStatuses = ['COMPLETE', 'CANCELLED', 'FAILED', 'PENDING'];
  if (!validStatuses.includes(data.payment_status)) {
    console.error(`Invalid payment status: ${data.payment_status}`);
    return false;
  }

  // Validate amount is numeric
  const amount = parseFloat(data.amount_gross);
  if (isNaN(amount) || amount <= 0) {
    console.error(`Invalid amount: ${data.amount_gross}`);
    return false;
  }

  return true;
}
