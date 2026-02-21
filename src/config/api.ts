// API Configuration
// Dynamically determines backend URL based on environment and hostname

const getApiUrl = (): string => {
  // Check if window is available (browser environment)
  if (typeof window === 'undefined') {
    // Server-side or build time, return default
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  // Check if we're in development
  if (import.meta.env.DEV) {
    // Check for localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // Check for local network IP (192.168.x.x, 10.x.x.x, etc.)
    const hostname = window.location.hostname;
    if (/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
      return `http://${hostname}:5000`;
    }
    
    // Check for ngrok or other tunnel URLs
    if (hostname.includes('ngrok') || hostname.includes('tunnel')) {
      return `https://${hostname}`;
    }
  }
  
  // Production: use current origin or set your production API URL
  return import.meta.env.VITE_API_URL || window.location.origin;
};

export const API_URL = getApiUrl();
