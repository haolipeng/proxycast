/**
 * Switch API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 * 注意：Switch 功能涉及本地文件操作，Web 版可能功能受限
 */

import { managementApi } from "./client";

export interface Provider {
  id: string;
  app_type: string;
  name: string;
  settings_config: Record<string, unknown>;
  category?: string;
  icon?: string;
  icon_color?: string;
  notes?: string;
  created_at?: number;
  sort_index?: number;
  is_current: boolean;
}

// proxycast 保留用于内部配置存储，但不在 UI 的 Tab 中显示
export type AppType = "claude" | "codex" | "gemini" | "proxycast";

// 同步状态枚举
export type SyncStatus = "InSync" | "OutOfSync" | "Conflict";

// 配置冲突信息
export interface ConfigConflict {
  field: string;
  local_value: string;
  external_value: string;
}

// 同步检查结果
export interface SyncCheckResult {
  status: SyncStatus;
  current_provider: string;
  external_provider: string;
  last_modified?: string;
  conflicts: ConfigConflict[];
}

export const switchApi = {
  getProviders: (appType: AppType): Promise<Provider[]> =>
    managementApi.get(`/switch/providers/${appType}`),

  getCurrentProvider: (appType: AppType): Promise<Provider | null> =>
    managementApi.get(`/switch/providers/${appType}/current`),

  addProvider: (provider: Provider): Promise<void> =>
    managementApi.post(`/switch/providers/${provider.app_type}`, provider),

  updateProvider: (provider: Provider): Promise<void> =>
    managementApi.put(
      `/switch/providers/${provider.app_type}/${provider.id}`,
      provider
    ),

  deleteProvider: (appType: AppType, id: string): Promise<void> =>
    managementApi.delete(`/switch/providers/${appType}/${id}`),

  switchProvider: (appType: AppType, id: string): Promise<void> =>
    managementApi.post(`/switch/providers/${appType}/${id}/activate`),

  /** 读取当前生效的配置（从实际配置文件读取）*/
  readLiveSettings: (appType: AppType): Promise<Record<string, unknown>> =>
    managementApi.get(`/switch/providers/${appType}/live-settings`),

  /** 检查配置同步状态 */
  checkConfigSync: (appType: AppType): Promise<SyncCheckResult> =>
    managementApi.get(`/switch/providers/${appType}/sync-status`),

  /** 从外部配置同步到 ProxyCast */
  syncFromExternal: (appType: AppType): Promise<string> =>
    managementApi.post(`/switch/providers/${appType}/sync-from-external`),
};
