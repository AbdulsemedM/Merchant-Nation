/**
 * Coop Merchant Platform (directory) client.
 * Reads fail OPEN (return null/[]); access checks fail CLOSED; writes throw.
 * API key must stay server-side only.
 */

export type FindOrCreatePayload = {
  appCode: string;
  externalId: string;
  businessName: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  tinNumber?: string;
  accountNumber?: string;
  accountHolderName?: string;
  verifiedAgainstBank?: boolean;
  addressRegion?: string;
  addressCity?: string;
  addressStreet?: string;
  addressPostal?: string;
};

export type DirectoryMerchant = {
  id: string;
  merchantCode?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  tinNumber?: string;
  status?: string;
  verificationStatus?: string;
  sourceApp?: string;
  matchedExisting?: boolean;
  apps?: string[];
  ownerName?: string;
  addressRegion?: string;
  addressCity?: string;
  addressStreet?: string;
  addressPostal?: string;
};

export type DirectoryOverview = {
  merchant?: DirectoryMerchant;
  legal?: {
    tinNumber?: string;
    nationalId?: string;
    verificationStatus?: string;
  };
  bankAccounts?: Array<{
    id?: string;
    accountNumber?: string;
    accountHolderName?: string;
    primary?: boolean;
    verifiedAgainstBank?: boolean;
  }>;
  licenses?: unknown[];
  locations?: unknown[];
  contacts?: unknown[];
  documents?: unknown[];
};

export type BankAccountOwnerLookup = {
  accountNumber: string;
  linked: boolean;
  ownerMerchantId?: string;
};

export type IdentityUpdateFields = {
  email?: string;
  ownerName?: string;
  phone?: string;
  businessName?: string;
  addressRegion?: string;
  addressCity?: string;
  addressStreet?: string;
  addressPostal?: string;
};

export type LegalInfoFields = {
  nationalId?: string;
  tinNumber?: string;
  vatNumber?: string;
  businessRegistrationNumber?: string;
  taxOffice?: string;
};

export type BankAccountPayload = {
  accountNumber: string;
  accountHolderName?: string;
  primary?: boolean;
  verifiedAgainstBank?: boolean;
};

type CacheEntry = { at: number; value: unknown };

export class CoopDirectoryClient {
  private base: string;
  private apiKey: string;
  private ttl: number;
  private _cache = new Map<string, CacheEntry>();

  constructor(baseUrl: string, apiKey: string, { cacheTtlMs = 60_000 } = {}) {
    this.base = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.ttl = cacheTtlMs;
  }

  get configured(): boolean {
    return Boolean(this.base && this.apiKey);
  }

  private async _req<T>(method: string, path: string, body?: unknown): Promise<T | null> {
    const res = await fetch(this.base + path, {
      method,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Directory ${method} ${path} -> ${res.status} ${detail}`);
    }
    if (res.status === 204) return null;
    return (await res.json()) as T;
  }

  private _cached<T>(key: string): T | undefined {
    const hit = this._cache.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.at >= this.ttl) return undefined;
    return hit.value as T;
  }

  invalidateMerchant(id: string): void {
    this._cache.delete("m:" + id);
    this._cache.delete("o:" + id);
  }

  // --- writes (throw on failure) ---

  findOrCreate(payload: FindOrCreatePayload): Promise<DirectoryMerchant | null> {
    return this._req<DirectoryMerchant>("POST", "/api/v1/merchants/find-or-create", payload);
  }

  updateIdentity(id: string, fields: IdentityUpdateFields): Promise<DirectoryMerchant | null> {
    this.invalidateMerchant(id);
    return this._req<DirectoryMerchant>("PUT", `/api/v1/merchants/${id}/identity`, fields);
  }

  saveLegalInfo(id: string, data: LegalInfoFields): Promise<unknown> {
    this.invalidateMerchant(id);
    return this._req("PUT", `/api/v1/merchants/${id}/legal-info`, data);
  }

  addBankAccount(id: string, acct: BankAccountPayload): Promise<unknown> {
    this.invalidateMerchant(id);
    return this._req("POST", `/api/v1/merchants/${id}/bank-accounts`, acct);
  }

  updateBankAccount(
    id: string,
    accountId: string,
    data: Partial<BankAccountPayload>
  ): Promise<unknown> {
    this.invalidateMerchant(id);
    return this._req("PUT", `/api/v1/merchants/${id}/bank-accounts/${accountId}`, data);
  }

  submitKyc(id: string): Promise<DirectoryMerchant | null> {
    this.invalidateMerchant(id);
    return this._req<DirectoryMerchant>("POST", `/api/v1/merchants/${id}/kyc/submit`);
  }

  // --- reads (fail open) ---

  async getMerchant(id: string): Promise<DirectoryMerchant | null> {
    const c = this._cached<DirectoryMerchant | null>("m:" + id);
    if (c !== undefined) return c;
    try {
      const v = await this._req<DirectoryMerchant>("GET", `/api/v1/merchants/${id}`);
      this._cache.set("m:" + id, { at: Date.now(), value: v });
      return v;
    } catch {
      return null;
    }
  }

  async getOverview(id: string): Promise<DirectoryOverview | null> {
    const c = this._cached<DirectoryOverview | null>("o:" + id);
    if (c !== undefined) return c;
    try {
      const v = await this._req<DirectoryOverview>("GET", `/api/v1/merchants/${id}/overview`);
      this._cache.set("o:" + id, { at: Date.now(), value: v });
      return v;
    } catch {
      return null;
    }
  }

  async listBankAccounts(id: string): Promise<DirectoryOverview["bankAccounts"]> {
    try {
      return (
        (await this._req<DirectoryOverview["bankAccounts"]>(
          "GET",
          `/api/v1/merchants/${id}/bank-accounts`
        )) ?? []
      );
    } catch {
      return [];
    }
  }

  async lookupAccountOwner(accountNumber: string): Promise<BankAccountOwnerLookup | null> {
    try {
      return await this._req<BankAccountOwnerLookup>(
        "GET",
        `/api/v1/merchants/bank-account-owner?accountNumber=${encodeURIComponent(accountNumber)}`
      );
    } catch {
      return null;
    }
  }

  async checkAccess(id: string, appCode: string): Promise<boolean> {
    try {
      const r = await this._req<{ allowed?: boolean }>(
        "GET",
        `/api/v1/merchants/${id}/applications/${appCode}/access`
      );
      return !!(r && r.allowed);
    } catch {
      return false;
    }
  }

  async listMerchants(appCode: string): Promise<DirectoryMerchant[]> {
    try {
      return (
        (await this._req<DirectoryMerchant[]>("GET", `/api/v1/applications/${appCode}/merchants`)) ??
        []
      );
    } catch {
      return [];
    }
  }
}

function createDirectoryClient(): CoopDirectoryClient {
  const url = process.env.MERCHANT_DIRECTORY_URL ?? "";
  const key = process.env.MERCHANT_DIRECTORY_API_KEY ?? "";
  return new CoopDirectoryClient(url, key);
}

/** Singleton — configured only when MERCHANT_DIRECTORY_URL + API_KEY are set. */
export const directory = createDirectoryClient();

export function getDirectoryAppCode(): string {
  return process.env.MERCHANT_DIRECTORY_APP_CODE ?? "MERCHANTNATION";
}
