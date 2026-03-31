/**
 * CORS Security Utility for Supabase Edge Functions
 * 
 * This utility provides secure CORS header management to prevent
 * cross-origin request forgery attacks.
 * 
 * Usage:
 *   import { getCorsHeaders } from "./utils/cors.ts";
 *   
 *   const origin = req.headers.get("Origin");
 *   const corsHeaders = getCorsHeaders(origin);
 */

// Allowed origins from environment variable
// Format: "https://alpha-appeal.co.za,https://www.alpha-appeal.co.za"
const ALLOWED_ORIGINS_STRING = Deno.env.get("ALLOWED_ORIGINS") || "";
const ALLOWED_ORIGINS = ALLOWED_ORIGINS_STRING.split(",").map(origin => origin.trim()).filter(Boolean);

// Fallback to production domain if no origins configured
const DEFAULT_ORIGIN = "https://alpha-appeal.co.za";

/**
 * Get secure CORS headers for a given origin
 * Only allows origins specified in ALLOWED_ORIGINS env var
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400", // 24 hours
  };

  // Validate origin against allowlist
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin"; // Important for caching
  } else {
    // Fallback to default production origin
    headers["Access-Control-Allow-Origin"] = DEFAULT_ORIGIN;
  }

  return headers;
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Create a CORS preflight response
 */
export function createCorsPreflightResponse(origin: string | null): Response {
  const headers = getCorsHeaders(origin);
  return new Response(null, { 
    status: 204,
    headers 
  });
}
