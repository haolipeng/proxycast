/**
 * Router API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

// Provider types
export type ProviderType =
  | "kiro"
  | "gemini"
  | "qwen"
  | "antigravity"
  | "openai"
  | "claude";

// Model alias mapping
export interface ModelAlias {
  alias: string;
  actual: string;
}

// Routing rule
export interface RoutingRule {
  pattern: string;
  target_provider: ProviderType;
  priority: number;
  enabled: boolean;
}

// Exclusion pattern
export interface ExclusionPattern {
  provider: ProviderType;
  pattern: string;
}

// Recommended preset
export interface RecommendedPreset {
  id: string;
  name: string;
  description: string;
  aliases: ModelAlias[];
  rules: RoutingRule[];
  endpoint_providers?: {
    cursor?: string;
    claude_code?: string;
    codex?: string;
    windsurf?: string;
    kiro?: string;
    other?: string;
  };
}

// Router configuration
export interface RouterConfig {
  default_provider: ProviderType;
  aliases: ModelAlias[];
  rules: RoutingRule[];
  exclusions: Record<ProviderType, string[]>;
}

export const routerApi = {
  // Get router configuration
  async getRouterConfig(): Promise<RouterConfig> {
    return managementApi.get("/router/config");
  },

  // Model aliases
  async addModelAlias(alias: string, actual: string): Promise<void> {
    return managementApi.post("/router/aliases", { alias, actual });
  },

  async removeModelAlias(alias: string): Promise<void> {
    return managementApi.delete(`/router/aliases/${encodeURIComponent(alias)}`);
  },

  async getModelAliases(): Promise<ModelAlias[]> {
    return managementApi.get("/router/aliases");
  },

  // Routing rules
  async addRoutingRule(rule: RoutingRule): Promise<void> {
    return managementApi.post("/router/rules", rule);
  },

  async removeRoutingRule(pattern: string): Promise<void> {
    return managementApi.delete(`/router/rules/${encodeURIComponent(pattern)}`);
  },

  async updateRoutingRule(pattern: string, rule: RoutingRule): Promise<void> {
    return managementApi.put(
      `/router/rules/${encodeURIComponent(pattern)}`,
      rule
    );
  },

  async getRoutingRules(): Promise<RoutingRule[]> {
    return managementApi.get("/router/rules");
  },

  // Exclusions
  async addExclusion(provider: ProviderType, pattern: string): Promise<void> {
    return managementApi.post("/router/exclusions", { provider, pattern });
  },

  async removeExclusion(
    provider: ProviderType,
    pattern: string
  ): Promise<void> {
    return managementApi.delete(
      `/router/exclusions/${provider}/${encodeURIComponent(pattern)}`
    );
  },

  async getExclusions(): Promise<Record<ProviderType, string[]>> {
    return managementApi.get("/router/exclusions");
  },

  // Default provider
  async setDefaultProvider(provider: ProviderType): Promise<void> {
    return managementApi.put("/router/default-provider", { provider });
  },

  // Recommended presets
  async getRecommendedPresets(): Promise<RecommendedPreset[]> {
    return managementApi.get("/router/presets");
  },

  async applyRecommendedPreset(
    presetId: string,
    merge: boolean = false
  ): Promise<void> {
    return managementApi.post(`/router/presets/${presetId}/apply`, { merge });
  },

  async clearAllRoutingConfig(): Promise<void> {
    return managementApi.delete("/router/config");
  },
};
