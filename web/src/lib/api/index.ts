/**
 * API 模块索引
 *
 * 导出所有 API 客户端和类型
 */

// HTTP 客户端
export { apiClient, managementApi } from './client';

// Tauri 兼容层（用于逐步迁移）
export { invoke } from './compat';

// API 模块
export { providerPoolApi } from './providerPool';
export type {
  PoolProviderType,
  ProviderPoolOverview,
  CredentialDisplay,
  AddCredentialRequest,
  UpdateCredentialRequest,
} from './providerPool';
