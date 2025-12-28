/**
 * Injection API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

// Injection mode
export type InjectionMode = "merge" | "override";

// Injection rule
export interface InjectionRule {
  id: string;
  pattern: string;
  parameters: Record<string, unknown>;
  mode: InjectionMode;
  priority: number;
  enabled: boolean;
}

// Injection configuration
export interface InjectionConfig {
  enabled: boolean;
  rules: InjectionRule[];
}

export const injectionApi = {
  // Get injection configuration
  async getInjectionConfig(): Promise<InjectionConfig> {
    return managementApi.get("/injection/config");
  },

  // Set injection enabled
  async setInjectionEnabled(enabled: boolean): Promise<void> {
    return managementApi.put("/injection/enabled", { enabled });
  },

  // Add injection rule
  async addInjectionRule(rule: InjectionRule): Promise<void> {
    return managementApi.post("/injection/rules", rule);
  },

  // Remove injection rule
  async removeInjectionRule(id: string): Promise<void> {
    return managementApi.delete(`/injection/rules/${id}`);
  },

  // Update injection rule
  async updateInjectionRule(id: string, rule: InjectionRule): Promise<void> {
    return managementApi.put(`/injection/rules/${id}`, rule);
  },

  // Get all injection rules
  async getInjectionRules(): Promise<InjectionRule[]> {
    return managementApi.get("/injection/rules");
  },
};
