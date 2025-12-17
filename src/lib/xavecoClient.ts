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

export class XavecoClient {
  private clientId: string;

  constructor() {
    // Generate or retrieve clientId from localStorage
    let id = localStorage.getItem('xaveco-client-id');
    if (!id) {
      id = `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('xaveco-client-id', id);
    }
    this.clientId = id;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-xaveco-client-id': this.clientId,
      'apikey': SUPABASE_ANON_KEY || '',
    };
  }

  async generateSuggestions(mode: Mode, tone: Tone, input?: string, imageBase64?: string): Promise<XavecoResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/xaveco`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        mode, 
        tone, 
        input: input || '', 
        image: imageBase64 || null 
      }),
    });

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
    const response = await fetch(`${SUPABASE_URL}/functions/v1/status`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async confirmCheckout(sessionId: string): Promise<{ ok: boolean; isPremium: boolean }> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/confirm-checkout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async upgrade(): Promise<UpgradeResponse> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/upgrade`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ clientId: this.clientId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getCustomerPortalUrl(): Promise<{ ok: boolean; url: string }> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/customer-portal`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ return_url: window.location.origin }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createPromoCheckout(): Promise<{ ok: boolean; url: string; sessionId: string }> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/promo-checkout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        success_url: `${window.location.origin}/checkout-success`,
        cancel_url: window.location.origin
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  getClientId(): string {
    return this.clientId;
  }
}

// Export singleton instance
export const xavecoClient = new XavecoClient();
