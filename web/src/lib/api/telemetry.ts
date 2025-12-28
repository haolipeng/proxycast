/**
 * Telemetry API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

// ========== 类型定义 ==========

export type RequestStatus =
  | "success"
  | "failed"
  | "timeout"
  | "retrying"
  | "cancelled";

export interface RequestLog {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  duration_ms: number;
  status: RequestStatus;
  http_status?: number;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  error_message?: string;
  is_streaming: boolean;
  credential_id?: string;
  retry_count: number;
}

export interface StatsSummary {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  timeout_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  min_latency_ms?: number;
  max_latency_ms?: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
}

export interface ProviderStats {
  provider?: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  timeout_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  min_latency_ms?: number;
  max_latency_ms?: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
}

export interface ModelStats {
  model: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  timeout_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  min_latency_ms?: number;
  max_latency_ms?: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
}

export interface TokenStatsSummary {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  record_count: number;
  actual_count: number;
  estimated_count: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
}

export interface ProviderTokenStats {
  provider?: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  record_count: number;
  actual_count: number;
  estimated_count: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
}

export interface ModelTokenStats {
  model: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  record_count: number;
  actual_count: number;
  estimated_count: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
}

export interface PeriodTokenStats {
  period_start?: string;
  period_end?: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  record_count: number;
  actual_count: number;
  estimated_count: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
}

export interface TimeRangeParam {
  start?: string;
  end?: string;
  preset?: "1h" | "24h" | "7d" | "30d";
}

// ========== 请求日志 API ==========

export async function getRequestLogs(params?: {
  provider?: string;
  model?: string;
  status?: RequestStatus;
  limit?: number;
}): Promise<RequestLog[]> {
  const query = new URLSearchParams();
  if (params?.provider) query.set("provider", params.provider);
  if (params?.model) query.set("model", params.model);
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", params.limit.toString());

  const queryStr = query.toString();
  return managementApi.get(
    `/telemetry/logs${queryStr ? `?${queryStr}` : ""}`
  );
}

export async function getRequestLogDetail(
  id: string
): Promise<RequestLog | null> {
  return managementApi.get(`/telemetry/logs/${id}`);
}

export async function clearRequestLogs(): Promise<void> {
  return managementApi.delete("/telemetry/logs");
}

// ========== 统计 API ==========

export async function getStatsSummary(
  timeRange?: TimeRangeParam
): Promise<StatsSummary> {
  return managementApi.post("/telemetry/stats/summary", {
    time_range: timeRange,
  });
}

export async function getStatsByProvider(
  timeRange?: TimeRangeParam
): Promise<Record<string, ProviderStats>> {
  return managementApi.post("/telemetry/stats/by-provider", {
    time_range: timeRange,
  });
}

export async function getStatsByModel(
  timeRange?: TimeRangeParam
): Promise<Record<string, ModelStats>> {
  return managementApi.post("/telemetry/stats/by-model", {
    time_range: timeRange,
  });
}

// ========== Token 统计 API ==========

export async function getTokenSummary(
  timeRange?: TimeRangeParam
): Promise<TokenStatsSummary> {
  return managementApi.post("/telemetry/tokens/summary", {
    time_range: timeRange,
  });
}

export async function getTokenStatsByProvider(
  timeRange?: TimeRangeParam
): Promise<Record<string, ProviderTokenStats>> {
  return managementApi.post("/telemetry/tokens/by-provider", {
    time_range: timeRange,
  });
}

export async function getTokenStatsByModel(
  timeRange?: TimeRangeParam
): Promise<Record<string, ModelTokenStats>> {
  return managementApi.post("/telemetry/tokens/by-model", {
    time_range: timeRange,
  });
}

export async function getTokenStatsByDay(
  days?: number
): Promise<PeriodTokenStats[]> {
  const query = days ? `?days=${days}` : "";
  return managementApi.get(`/telemetry/tokens/by-day${query}`);
}
