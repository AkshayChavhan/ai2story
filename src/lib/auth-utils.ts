import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Server-side authentication utility functions.
 * Token generation, password hashing, device parsing, IP extraction.
 */

// ─── Token Generation ────────────────────────────────────────────────

/**
 * Generate a cryptographically secure random token.
 * Used for email verification and password reset tokens.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Password Hashing ────────────────────────────────────────────────

/**
 * Hash a password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Token Expiry ────────────────────────────────────────────────────

/**
 * Check if a token has expired.
 */
export function isTokenExpired(expires: Date): boolean {
  return new Date() > expires;
}

/**
 * Create an expiry date N hours from now.
 */
export function createTokenExpiry(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// ─── Device Info Parsing ─────────────────────────────────────────────

interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
}

/**
 * Parse the User-Agent header to extract browser, OS, and device type.
 * Uses simple regex patterns — no external dependency needed.
 */
export function getDeviceInfo(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  }

  // Detect browser
  let browser = "Unknown";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg/")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR"))
    browser = "Opera";

  // Detect OS
  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac OS")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";

  // Detect device type
  let device = "Desktop";
  if (
    userAgent.includes("Mobile") ||
    userAgent.includes("Android") ||
    userAgent.includes("iPhone")
  ) {
    device = "Mobile";
  } else if (userAgent.includes("iPad") || userAgent.includes("Tablet")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

// ─── IP Address Extraction ───────────────────────────────────────────

/**
 * Extract the client IP address from request headers.
 * Checks x-forwarded-for and x-real-ip headers (common with reverse proxies).
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}
