/**
 * Provider Pool API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

// Provider types supported by the pool
export type PoolProviderType =
  | "kiro"
  | "gemini"
  | "qwen"
  | "antigravity"
  | "openai"
  | "claude"
  | "codex"
  | "claude_oauth"
  | "iflow"
  | "gemini_api_key";

// Credential data types
export interface KiroOAuthCredential {
  type: "kiro_oauth";
  creds_file_path: string;
}

export interface GeminiOAuthCredential {
  type: "gemini_oauth";
  creds_file_path: string;
  project_id?: string;
}

export interface QwenOAuthCredential {
  type: "qwen_oauth";
  creds_file_path: string;
}

export interface AntigravityOAuthCredential {
  type: "antigravity_oauth";
  creds_file_path: string;
  project_id?: string;
}

export interface OpenAIKeyCredential {
  type: "openai_key";
  api_key: string;
  base_url?: string;
}

export interface ClaudeKeyCredential {
  type: "claude_key";
  api_key: string;
  base_url?: string;
}

export interface GeminiApiKeyCredential {
  type: "gemini_api_key";
  api_key: string;
  base_url?: string;
  excluded_models?: string[];
}

export interface CodexOAuthCredential {
  type: "codex_oauth";
  creds_file_path: string;
}

export interface ClaudeOAuthCredential {
  type: "claude_oauth";
  creds_file_path: string;
}

export interface IFlowOAuthCredential {
  type: "iflow_oauth";
  creds_file_path: string;
}

export interface IFlowCookieCredential {
  type: "iflow_cookie";
  creds_file_path: string;
}

export type CredentialData =
  | KiroOAuthCredential
  | GeminiOAuthCredential
  | QwenOAuthCredential
  | AntigravityOAuthCredential
  | OpenAIKeyCredential
  | ClaudeKeyCredential
  | GeminiApiKeyCredential
  | CodexOAuthCredential
  | ClaudeOAuthCredential
  | IFlowOAuthCredential
  | IFlowCookieCredential;

// Provider credential
export interface ProviderCredential {
  uuid: string;
  provider_type: PoolProviderType;
  credential: CredentialData;
  name?: string;
  is_healthy: boolean;
  is_disabled: boolean;
  check_health: boolean;
  check_model_name?: string;
  not_supported_models: string[];
  usage_count: number;
  error_count: number;
  last_used?: string;
  last_error_time?: string;
  last_error_message?: string;
  last_health_check_time?: string;
  last_health_check_model?: string;
  created_at: string;
  updated_at: string;
}

// Credential source type
export type CredentialSource = "manual" | "imported" | "private";

// Credential display (for UI, hides sensitive data)
export interface CredentialDisplay {
  uuid: string;
  provider_type: PoolProviderType;
  credential_type: string;
  name?: string;
  display_credential: string;
  is_healthy: boolean;
  is_disabled: boolean;
  check_health: boolean;
  check_model_name?: string;
  not_supported_models: string[];
  usage_count: number;
  error_count: number;
  last_used?: string;
  last_error_time?: string;
  last_error_message?: string;
  last_health_check_time?: string;
  last_health_check_model?: string;
  oauth_status?: OAuthStatus;
  token_cache_status?: TokenCacheStatus;
  created_at: string;
  updated_at: string;
  // 凭证来源（手动添加/导入/私有）
  source: CredentialSource;
  // API Key 凭证的 base_url（仅用于 OpenAI/Claude API Key 类型）
  base_url?: string;
  // API Key 凭证的完整 api_key（仅用于 OpenAI/Claude API Key 类型，用于编辑）
  api_key?: string;
  // 凭证级代理 URL（可覆盖全局代理设置）
  proxy_url?: string;
}

// Pool statistics
export interface PoolStats {
  total: number;
  healthy: number;
  unhealthy: number;
  disabled: number;
  total_usage: number;
  total_errors: number;
}

// Provider pool overview
export interface ProviderPoolOverview {
  provider_type: string;
  stats: PoolStats;
  credentials: CredentialDisplay[];
}

// Health check result
export interface HealthCheckResult {
  uuid: string;
  success: boolean;
  model?: string;
  message?: string;
  duration_ms: number;
}

// OAuth status
export interface OAuthStatus {
  has_access_token: boolean;
  has_refresh_token: boolean;
  is_token_valid: boolean;
  expiry_info?: string;
  creds_path: string;
}

// Token cache status (from database cache)
export interface TokenCacheStatus {
  has_cached_token: boolean;
  is_valid: boolean;
  is_expiring_soon: boolean;
  expiry_time?: string;
  last_refresh?: string;
  refresh_error_count: number;
  last_refresh_error?: string;
}

// Request types
export interface AddCredentialRequest {
  provider_type: string;
  credential: CredentialData;
  name?: string;
  check_health?: boolean;
  check_model_name?: string;
}

export interface UpdateCredentialRequest {
  name?: string;
  is_disabled?: boolean;
  check_health?: boolean;
  check_model_name?: string;
  not_supported_models?: string[];
  /// 新的凭证文件路径（仅适用于OAuth凭证，用于重新上传文件）
  new_creds_file_path?: string;
  /// OAuth相关：新的project_id（仅适用于Gemini）
  new_project_id?: string;
  /// API Key 相关：新的 base_url（仅适用于 API Key 凭证）
  new_base_url?: string;
  /// API Key 相关：新的 api_key（仅适用于 API Key 凭证）
  new_api_key?: string;
  /// 新的代理 URL（可覆盖全局代理设置）
  new_proxy_url?: string;
}

// API 响应类型（后端返回格式）
interface ProviderPoolOverviewApiResponse {
  provider_type: string;
  total_count: number;
  active_count: number;
  healthy_count: number;
}

interface CredentialDisplayApiResponse {
  uuid: string;
  name?: string;
  provider_type: string;
  credential_type: string;
  is_healthy: boolean;
  is_disabled: boolean;
  usage_count: number;
  last_used?: string;
  created_at: string;
}

export const providerPoolApi = {
  // Get overview of all provider pools
  async getOverview(): Promise<ProviderPoolOverview[]> {
    const response = await managementApi.get<ProviderPoolOverviewApiResponse[]>(
      "/provider-pool/overview"
    );
    // 转换为前端期望的格式
    return response.map((r) => ({
      provider_type: r.provider_type,
      stats: {
        total: r.total_count,
        healthy: r.healthy_count,
        unhealthy: r.total_count - r.healthy_count,
        disabled: r.total_count - r.active_count,
        total_usage: 0,
        total_errors: 0,
      },
      credentials: [],
    }));
  },

  // Get credentials for a specific provider type
  async getCredentials(
    providerType: PoolProviderType
  ): Promise<CredentialDisplay[]> {
    const response = await managementApi.get<CredentialDisplayApiResponse[]>(
      `/provider-pool/credentials/by-type/${providerType}`
    );
    // 转换为前端期望的格式
    return response.map((r) => ({
      uuid: r.uuid,
      provider_type: r.provider_type as PoolProviderType,
      credential_type: r.credential_type,
      name: r.name,
      display_credential: "",
      is_healthy: r.is_healthy,
      is_disabled: r.is_disabled,
      check_health: true,
      not_supported_models: [],
      usage_count: r.usage_count,
      error_count: 0,
      last_used: r.last_used,
      created_at: r.created_at,
      updated_at: r.created_at,
      source: "manual" as CredentialSource,
    }));
  },

  // Add a generic credential
  async addCredential(
    request: AddCredentialRequest
  ): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/credentials", request);
  },

  // Update a credential
  async updateCredential(
    uuid: string,
    request: UpdateCredentialRequest
  ): Promise<ProviderCredential> {
    return managementApi.put(`/provider-pool/credentials/${uuid}`, request);
  },

  // Delete a credential
  async deleteCredential(
    uuid: string,
    _providerType?: PoolProviderType
  ): Promise<boolean> {
    return managementApi.delete(`/provider-pool/credentials/${uuid}`);
  },

  // Toggle credential enabled/disabled
  async toggleCredential(
    uuid: string,
    _isDisabled: boolean
  ): Promise<ProviderCredential> {
    return managementApi.post(`/provider-pool/credentials/${uuid}/toggle`);
  },

  // Reset credential counters
  async resetCredential(uuid: string): Promise<void> {
    return managementApi.post(`/provider-pool/credentials/${uuid}/reset`);
  },

  // Reset health status for all credentials of a type
  async resetHealth(providerType: PoolProviderType): Promise<number> {
    return managementApi.post(`/provider-pool/credentials/reset-health`, {
      provider_type: providerType,
    });
  },

  // Check health of a single credential
  async checkCredentialHealth(uuid: string): Promise<HealthCheckResult> {
    return managementApi.post(`/provider-pool/credentials/${uuid}/health`);
  },

  // Check health of all credentials of a type
  async checkTypeHealth(
    providerType: PoolProviderType
  ): Promise<HealthCheckResult[]> {
    return managementApi.post(`/provider-pool/credentials/check-health`, {
      provider_type: providerType,
    });
  },

  // Provider-specific add methods (use generic addCredential in web version)
  async addKiroOAuth(
    credsFilePath: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "kiro",
      credential: { type: "kiro_oauth", creds_file_path: credsFilePath },
      name,
    });
  },

  async addKiroFromJson(
    jsonContent: string,
    name?: string
  ): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/credentials/kiro/from-json", {
      json_content: jsonContent,
      name,
    });
  },

  async addGeminiOAuth(
    credsFilePath: string,
    projectId?: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "gemini",
      credential: {
        type: "gemini_oauth",
        creds_file_path: credsFilePath,
        project_id: projectId,
      },
      name,
    });
  },

  async addQwenOAuth(
    credsFilePath: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "qwen",
      credential: { type: "qwen_oauth", creds_file_path: credsFilePath },
      name,
    });
  },

  async addOpenAIKey(
    apiKey: string,
    baseUrl?: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "openai",
      credential: { type: "openai_key", api_key: apiKey, base_url: baseUrl },
      name,
    });
  },

  async addClaudeKey(
    apiKey: string,
    baseUrl?: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "claude",
      credential: { type: "claude_key", api_key: apiKey, base_url: baseUrl },
      name,
    });
  },

  async addGeminiApiKey(
    apiKey: string,
    baseUrl?: string,
    excludedModels?: string[],
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "gemini_api_key",
      credential: {
        type: "gemini_api_key",
        api_key: apiKey,
        base_url: baseUrl,
        excluded_models: excludedModels,
      },
      name,
    });
  },

  async addAntigravityOAuth(
    credsFilePath: string,
    projectId?: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "antigravity",
      credential: {
        type: "antigravity_oauth",
        creds_file_path: credsFilePath,
        project_id: projectId,
      },
      name,
    });
  },

  async addCodexOAuth(
    credsFilePath: string,
    _apiBaseUrl?: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "codex",
      credential: { type: "codex_oauth", creds_file_path: credsFilePath },
      name,
    });
  },

  async addClaudeOAuth(
    credsFilePath: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "claude_oauth",
      credential: { type: "claude_oauth", creds_file_path: credsFilePath },
      name,
    });
  },

  async addIFlowOAuth(
    credsFilePath: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "iflow",
      credential: { type: "iflow_oauth", creds_file_path: credsFilePath },
      name,
    });
  },

  async addIFlowCookie(
    credsFilePath: string,
    name?: string
  ): Promise<ProviderCredential> {
    return this.addCredential({
      provider_type: "iflow",
      credential: { type: "iflow_cookie", creds_file_path: credsFilePath },
      name,
    });
  },

  // OAuth login methods (Web version - show URL and wait for callback)
  async startAntigravityOAuthLogin(
    name?: string,
    skipProjectIdFetch?: boolean
  ): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/antigravity/start", {
      name,
      skip_project_id_fetch: skipProjectIdFetch,
    });
  },

  async getAntigravityAuthUrlAndWait(
    name?: string,
    skipProjectIdFetch?: boolean
  ): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/antigravity/auth-url", {
      name,
      skip_project_id_fetch: skipProjectIdFetch,
    });
  },

  async startCodexOAuthLogin(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/codex/start", { name });
  },

  async getCodexAuthUrlAndWait(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/codex/auth-url", { name });
  },

  async startClaudeOAuthLogin(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/claude/start", { name });
  },

  async getClaudeOAuthAuthUrlAndWait(
    name?: string
  ): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/claude/auth-url", { name });
  },

  async claudeOAuthWithCookie(
    sessionKey: string,
    isSetupToken?: boolean,
    name?: string
  ): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/claude/cookie", {
      session_key: sessionKey,
      is_setup_token: isSetupToken,
      name,
    });
  },

  async startQwenDeviceCodeLogin(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/qwen/start", { name });
  },

  async getQwenDeviceCodeAndWait(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/qwen/device-code", {
      name,
    });
  },

  async startIFlowOAuthLogin(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/iflow/start", { name });
  },

  async getIFlowAuthUrlAndWait(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/iflow/auth-url", { name });
  },

  async startGeminiOAuthLogin(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/gemini/start", { name });
  },

  async getGeminiAuthUrlAndWait(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/gemini/auth-url", { name });
  },

  async exchangeGeminiCode(
    code: string,
    sessionId?: string,
    name?: string
  ): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/gemini/exchange", {
      code,
      session_id: sessionId,
      name,
    });
  },

  // Kiro Builder ID login
  async startKiroBuilderIdLogin(
    region?: string
  ): Promise<KiroBuilderIdLoginResponse> {
    return managementApi.post("/provider-pool/oauth/kiro/builder-id/start", {
      region,
    });
  },

  async pollKiroBuilderIdAuth(): Promise<KiroBuilderIdPollResponse> {
    return managementApi.post("/provider-pool/oauth/kiro/builder-id/poll");
  },

  async cancelKiroBuilderIdLogin(): Promise<boolean> {
    return managementApi.post("/provider-pool/oauth/kiro/builder-id/cancel");
  },

  async addKiroFromBuilderIdAuth(name?: string): Promise<ProviderCredential> {
    return managementApi.post("/provider-pool/oauth/kiro/builder-id/add", {
      name,
    });
  },

  // Kiro Social Auth login
  async startKiroSocialAuthLogin(
    provider: "Google" | "Github"
  ): Promise<KiroSocialAuthLoginResponse> {
    return managementApi.post("/provider-pool/oauth/kiro/social/start", {
      provider,
    });
  },

  async exchangeKiroSocialAuthToken(
    code: string,
    state: string
  ): Promise<KiroSocialAuthTokenResponse> {
    return managementApi.post("/provider-pool/oauth/kiro/social/exchange", {
      code,
      state,
    });
  },

  async cancelKiroSocialAuthLogin(): Promise<boolean> {
    return managementApi.post("/provider-pool/oauth/kiro/social/cancel");
  },

  async startKiroSocialAuthCallbackServer(): Promise<boolean> {
    return managementApi.post(
      "/provider-pool/oauth/kiro/social/start-callback"
    );
  },

  // OAuth token management
  async refreshCredentialToken(uuid: string): Promise<string> {
    return managementApi.post(`/provider-pool/credentials/${uuid}/refresh`);
  },

  async getCredentialOAuthStatus(uuid: string): Promise<OAuthStatus> {
    return managementApi.get(`/provider-pool/credentials/${uuid}/oauth-status`);
  },

  // Migration API
  async migratePrivateConfig(config: unknown): Promise<MigrationResult> {
    return managementApi.post("/provider-pool/migrate", { config });
  },
};

// Migration result
export interface MigrationResult {
  migrated_count: number;
  skipped_count: number;
  errors: string[];
}

// Kiro Builder ID 登录响应
export interface KiroBuilderIdLoginResponse {
  success: boolean;
  userCode?: string;
  verificationUri?: string;
  expiresIn?: number;
  interval?: number;
  error?: string;
}

// Kiro Builder ID 轮询响应
export interface KiroBuilderIdPollResponse {
  success: boolean;
  completed: boolean;
  status?: string;
  error?: string;
}

// Kiro Social Auth 登录响应
export interface KiroSocialAuthLoginResponse {
  success: boolean;
  loginUrl?: string;
  state?: string;
  error?: string;
}

// Kiro Social Auth Token 交换响应
export interface KiroSocialAuthTokenResponse {
  success: boolean;
  error?: string;
}

// Kiro 凭证指纹信息
export interface KiroFingerprintInfo {
  /** Machine ID（SHA256 哈希，64 字符） */
  machine_id: string;
  /** Machine ID 的短格式（前 16 字符） */
  machine_id_short: string;
  /** 指纹来源（profileArn / clientId / system） */
  source: string;
  /** 认证方式 */
  auth_method: string;
}

// Playwright 状态
export interface PlaywrightStatus {
  /** 浏览器是否可用 */
  available: boolean;
  /** 浏览器可执行文件路径 */
  browserPath?: string;
  /** 浏览器来源: "system" 或 "playwright" */
  browserSource?: "system" | "playwright";
  /** 错误信息 */
  error?: string;
}

// 获取 Kiro 凭证的指纹信息
export async function getKiroCredentialFingerprint(
  uuid: string
): Promise<KiroFingerprintInfo> {
  return managementApi.get(`/provider-pool/credentials/${uuid}/fingerprint`);
}

// ============ Kiro 凭证池管理 HTTP API ============

/** 可用凭证信息 */
export interface AvailableCredential {
  /** 凭证UUID */
  uuid: string;
  /** 凭证名称 */
  name: string;
  /** 是否可用 */
  available: boolean;
  /** Token过期时间 */
  expires_at?: string;
  /** 最后使用时间 */
  last_used?: string;
  /** 健康状态分数 (0-100) */
  health_score: number;
  /** 错误计数 */
  error_count: number;
  /** 最后错误信息 */
  last_error?: string;
}

/** 获取可用凭证列表的响应 */
export interface AvailableCredentialsResponse {
  /** 可用凭证列表 */
  credentials: AvailableCredential[];
  /** 总凭证数 */
  total: number;
  /** 可用凭证数 */
  available: number;
  /** 系统状态 */
  status: string;
}

/** 选择凭证请求参数 */
export interface SelectCredentialRequest {
  /** 指定模型（可选） */
  model?: string;
  /** 强制选择特定UUID（可选） */
  force_uuid?: string;
}

/** 选择凭证响应 */
export interface SelectCredentialResponse {
  /** 选中的凭证UUID */
  uuid: string;
  /** 凭证名称 */
  name: string;
  /** Access Token（脱敏显示） */
  access_token_preview: string;
  /** Token过期时间 */
  expires_at?: string;
  /** 选择原因 */
  selection_reason: string;
}

/** 刷新凭证响应 */
export interface RefreshCredentialResponse {
  /** 凭证UUID */
  uuid: string;
  /** 刷新是否成功 */
  success: boolean;
  /** 新的过期时间 */
  new_expires_at?: string;
  /** 刷新结果信息 */
  message: string;
  /** 错误信息（如果有） */
  error?: string;
}

/** Kiro 凭证池管理 API */
export const kiroCredentialApi = {
  /** 获取可用凭证列表 */
  async getAvailableCredentials(): Promise<AvailableCredentialsResponse> {
    const response = await fetch("/api/kiro/credentials/available");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  /** 智能选择凭证 */
  async selectCredential(
    request: SelectCredentialRequest
  ): Promise<SelectCredentialResponse> {
    const response = await fetch("/api/kiro/credentials/select", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  },

  /** 手动刷新指定凭证 */
  async refreshCredential(uuid: string): Promise<RefreshCredentialResponse> {
    const response = await fetch(`/api/kiro/credentials/${uuid}/refresh`, {
      method: "PUT",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  },

  /** 获取凭证详细状态 */
  async getCredentialStatus(uuid: string): Promise<Record<string, unknown>> {
    const response = await fetch(`/api/kiro/credentials/${uuid}/status`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  },
};

// ============ Playwright 指纹浏览器登录（Web版不支持）============

/**
 * 检查 Playwright 是否可用
 * Web 版不支持 Playwright
 */
export async function checkPlaywrightAvailable(): Promise<PlaywrightStatus> {
  return {
    available: false,
    error: "Playwright is not available in web version",
  };
}

/**
 * 安装 Playwright Chromium 浏览器
 * Web 版不支持
 */
export async function installPlaywright(): Promise<PlaywrightStatus> {
  return {
    available: false,
    error: "Playwright installation is not available in web version",
  };
}

/**
 * 使用 Playwright 指纹浏览器启动 Kiro 登录
 * Web 版不支持
 */
export async function startKiroPlaywrightLogin(
  _provider: "Google" | "Github" | "BuilderId",
  _name?: string
): Promise<ProviderCredential> {
  throw new Error("Playwright login is not available in web version");
}

/**
 * 取消 Playwright 登录
 * Web 版不支持
 */
export async function cancelKiroPlaywrightLogin(): Promise<boolean> {
  return false;
}
