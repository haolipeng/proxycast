/**
 * Credentials API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

export type OAuthProvider = "kiro" | "gemini" | "qwen";

export interface OAuthCredentialStatus {
  provider: string;
  loaded: boolean;
  has_access_token: boolean;
  has_refresh_token: boolean;
  is_valid: boolean;
  expiry_info: string | null;
  creds_path: string;
  extra: Record<string, unknown>;
}

export interface EnvVariable {
  key: string;
  value: string;
  masked: string;
}

export interface CheckResult {
  changed: boolean;
  new_hash: string;
  reloaded: boolean;
}

export const credentialsApi = {
  /** Get credentials status for a specific provider */
  getCredentials: (provider: OAuthProvider): Promise<OAuthCredentialStatus> =>
    managementApi.get(`/credentials/oauth/${provider}`),

  /** Get all OAuth credentials at once */
  getAllCredentials: (): Promise<OAuthCredentialStatus[]> =>
    managementApi.get("/credentials/oauth"),

  /** Reload credentials from file */
  reloadCredentials: (provider: OAuthProvider): Promise<string> =>
    managementApi.post(`/credentials/oauth/${provider}/reload`),

  /** Refresh OAuth token */
  refreshToken: (provider: OAuthProvider): Promise<string> =>
    managementApi.post(`/credentials/oauth/${provider}/refresh`),

  /** Get environment variables for a provider */
  getEnvVariables: (provider: OAuthProvider): Promise<EnvVariable[]> =>
    managementApi.get(`/credentials/oauth/${provider}/env`),

  /** Get token file hash for change detection */
  getTokenFileHash: (provider: OAuthProvider): Promise<string> =>
    managementApi.get(`/credentials/oauth/${provider}/hash`),

  /** Check and reload credentials if file changed */
  checkAndReload: (
    provider: OAuthProvider,
    lastHash: string,
  ): Promise<CheckResult> =>
    managementApi.post(`/credentials/oauth/${provider}/check-reload`, {
      last_hash: lastHash,
    }),
};
