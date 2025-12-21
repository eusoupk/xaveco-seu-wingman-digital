const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type Mode = "reply" | "initiate" | "tension";
export type Tone = "casual" | "provocative" | "playful" | "indifferent" | "romantic" | "funny";

export interface XavecoResponse {
  suggestions: string[];
  trial?: {
    usedCount: number;
    limit: number;
    trialStart: number;
    expiresAt: number;
  };
  premium: boolean;
}

export interface CheckResponse {
  ok: boolean;
  isPremium: boolean;
  freePlaysLeft?: number;
  daysLeft?: number | null;
  premiumUntil?: string | null;
}

export interface UpgradeResponse {
  ok: boolean;
}

// Storage helper with fallback
const safeStorage = {
  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) return value;
    } catch {
      // localStorage failed, try sessionStorage
    }
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage failed, fallback to sessionStorage
    }
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Both failed, continue silently
    }
  }
};

// Fetch with timeout using AbortController
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 25000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class XavecoClient {
  private clientId: string;

  constructor() {
    this.clientId = this.ensureValidClientId();
  }

  // Defensive client_id validation and generation
  private ensureValidClientId(): string {
    let id = safeStorage.getItem('xaveco-client-id');
    
    // Validate: must exist, be non-empty, and have expected format
    if (!id || id.trim() === '' || !id.startsWith('client_')) {
      id = `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      safeStorage.setItem('xaveco-client-id', id);
    }
    
    return id;
  }

  // Re-validate before each request
  private getValidClientId(): string {
    // Re-check in case storage was cleared
    const storedId = safeStorage.getItem('xaveco-client-id');
    if (!storedId || storedId.trim() === '' || !storedId.startsWith('client_')) {
      this.clientId = this.ensureValidClientId();
    }
    return this.clientId;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-xaveco-client-id': this.getValidClientId(),
      'apikey': SUPABASE_ANON_KEY || '',
    };
  }

  async generateSuggestions(mode: Mode, tone: Tone, input?: string, imageBase64?: string): Promise<XavecoResponse> {
    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/xaveco`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          mode, 
          tone, 
          input: input || '', 
          image: imageBase64 || null 
        }),
      },
      25000 // 25 second timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 402 && (errorData.error === 'trial_expired' || errorData.error === 'trial_exhausted')) {
        const error = new Error(errorData.message || 'Trial expired') as any;
        error.code = 'trial_expired';
        error.trial = errorData.trial;
        throw error;
      }

      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async checkStatus(): Promise<CheckResponse> {
    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/status`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      },
      15000 // 15 second timeout for status check
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async confirmCheckout(sessionId: string): Promise<{ ok: boolean; isPremium: boolean }> {
    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/confirm-checkout`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ session_id: sessionId }),
      },
      20000 // 20 second timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async upgrade(): Promise<UpgradeResponse> {
    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/upgrade`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ clientId: this.getValidClientId() }),
      },
      20000 // 20 second timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getCustomerPortalUrl(): Promise<{ ok: boolean; url: string }> {
    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/customer-portal`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ return_url: window.location.origin }),
      },
      20000 // 20 second timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  getClientId(): string {
    return this.getValidClientId();
  }
}

// Export singleton instance
export const xavecoClient = new XavecoClient();
