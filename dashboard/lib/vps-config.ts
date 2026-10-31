/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║            VPS Connection Resolver for Next.js Dashboard         ║
 * ║                                                                  ║
 * ║   Allows connecting to the bot backend using ONLY:               ║
 * ║     - VPS_IP (e.g. 143.198.12.34 or myvps.host.com)             ║
 * ║     - VPS_PORT (e.g. 8080)                                       ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export interface VpsConfig {
  ip: string;
  port: string;
  protocol?: string;
  apiKey?: string;
}

export const DEFAULT_VPS_IP = "18.179.3.11";
export const DEFAULT_VPS_PORT = "25566";

/**
 * Resolves the target VPS API URL (e.g. http://18.179.3.11:25566/api/v1)
 */
export function getVpsTargetUrl(customConfig?: Partial<VpsConfig>): string {
  let ip = customConfig?.ip || process.env.VPS_IP || process.env.NEXT_PUBLIC_VPS_IP || DEFAULT_VPS_IP;
  let port = customConfig?.port || process.env.VPS_PORT || process.env.NEXT_PUBLIC_VPS_PORT || DEFAULT_VPS_PORT;
  let protocol = customConfig?.protocol || process.env.VPS_PROTOCOL || "http";

  // If a full custom URL is explicitly set in NEXT_PUBLIC_API_URL and is not pointing to vercel.app
  if (!ip && process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("vercel.app")) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  if (!ip) {
    ip = DEFAULT_VPS_IP;
  }

  // Clean IP/Host (strip http:// or https:// and trailing slashes)
  let cleanIp = ip.trim().replace(/\/+$/, "");
  if (cleanIp.startsWith("https://")) {
    protocol = "https";
    cleanIp = cleanIp.replace(/^https:\/\//i, "");
  } else if (cleanIp.startsWith("http://")) {
    protocol = "http";
    cleanIp = cleanIp.replace(/^http:\/\//i, "");
  }

  // If IP contains an embedded port (e.g. "1.2.3.4:8080"), split it
  if (cleanIp.includes(":") && !cleanIp.includes("]")) {
    const parts = cleanIp.split(":");
    cleanIp = parts[0];
    if (parts[1]) {
      port = parts[1];
    }
  }

  const cleanPort = String(port).trim().replace(/[^0-9]/g, "") || DEFAULT_VPS_PORT;

  return `${protocol}://${cleanIp}:${cleanPort}/api/v1`;
}

/**
 * Helper to get active client-side VPS configuration from localStorage/cookies
 */
export function getClientVpsConfig(): VpsConfig | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("vps_connection");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.ip) {
        return {
          ip: parsed.ip,
          port: parsed.port || DEFAULT_VPS_PORT,
          protocol: parsed.protocol || "http",
          apiKey: parsed.apiKey || "",
        };
      }
    }
  } catch {}

  return null;
}
