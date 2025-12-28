/**
 * Resilience API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

// Retry configuration
export interface RetryConfig {
  max_retries: number;
  base_delay_ms: number;
  max_delay_ms: number;
  retryable_codes: number[];
}

// Failover configuration
export interface FailoverConfig {
  auto_switch: boolean;
  switch_on_quota: boolean;
}

// Switch log entry
export interface SwitchLogEntry {
  from_provider: string;
  to_provider: string;
  failure_type: string;
  timestamp: string;
}

export const resilienceApi = {
  // Retry config
  async getRetryConfig(): Promise<RetryConfig> {
    return managementApi.get("/resilience/retry");
  },

  async updateRetryConfig(config: RetryConfig): Promise<void> {
    return managementApi.put("/resilience/retry", config);
  },

  // Failover config
  async getFailoverConfig(): Promise<FailoverConfig> {
    return managementApi.get("/resilience/failover");
  },

  async updateFailoverConfig(config: FailoverConfig): Promise<void> {
    return managementApi.put("/resilience/failover", config);
  },

  // Switch log
  async getSwitchLog(): Promise<SwitchLogEntry[]> {
    return managementApi.get("/resilience/switch-log");
  },

  async clearSwitchLog(): Promise<void> {
    return managementApi.delete("/resilience/switch-log");
  },
};
