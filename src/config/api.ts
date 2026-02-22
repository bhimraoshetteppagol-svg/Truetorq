// API Configuration
// Dynamically determines backend URL based on environment and hostname

const getApiUrl = (): string => {
  // Guard for non-browser environments (build, tests)
  if (typeof window === "undefined") {
    return import.meta.env.VITE_API_URL || "http://localhost:5000";
  }

  // Check for explicit API URL in environment (for ngrok backend)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development heuristics
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Localhost
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }

    // Local network IPs (private IP ranges)
    if (/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
      return `http://${hostname}:5000`;
    }

    // Public IP addresses (IPv4)
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `http://${hostname}:5000`;
    }

    // Tunnels (ngrok, etc.) - use HTTPS
    if (hostname.includes("ngrok") || 
        hostname.includes("tunnel") || 
        hostname.endsWith(".ngrok.io") ||
        hostname.endsWith(".ngrok-free.app")) {
      // When using ngrok, you need to set VITE_API_URL to your ngrok backend URL
      // For now, return the same domain (will need manual config via .env.local)
      return `https://${hostname}`;
    }
  }

  // Production: use current origin
  return import.meta.env.VITE_API_URL || window.location.origin;
};

export const API_URL = getApiUrl();
