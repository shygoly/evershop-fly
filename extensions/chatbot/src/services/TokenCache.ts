/**
 * Token cache for managing authentication tokens
 * Based on chatbot/app/TokenCache.js implementation
 */

interface TokenInfo {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresTime: number;
  tenantId: number;
  shopId: string;
}

class TokenCache {
  private cache: Map<string, TokenInfo>;

  constructor() {
    this.cache = new Map();
  }

  get(shopId: string): TokenInfo | undefined {
    return this.cache.get(shopId);
  }

  set(shopId: string, tokenInfo: TokenInfo): void {
    this.cache.set(shopId, tokenInfo);
  }

  delete(shopId: string): void {
    this.cache.delete(shopId);
  }

  clear(): void {
    this.cache.clear();
  }

  has(shopId: string): boolean {
    return this.cache.has(shopId);
  }

  isTokenValid(shopId: string): boolean {
    const tokenInfo = this.get(shopId);
    if (!tokenInfo) return false;
    
    const now = Date.now();
    // Token expires 100ms before actual expiry for safety
    return now < tokenInfo.expiresTime - 100;
  }
}

export const tokenCache = new TokenCache();
export type { TokenInfo };

