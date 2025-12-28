/**
 * LLM Flow Monitor API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 * 提供 Flow 查询、搜索、统计、导出和标注管理
 */

import { managementApi } from "./client";

// ============================================================================
// Provider 类型
// ============================================================================

/**
 * 提供商类型
 */
export type ProviderType =
  | "Kiro"
  | "Gemini"
  | "Qwen"
  | "Antigravity"
  | "OpenAI"
  | "Claude"
  | "Vertex"
  | "GeminiApiKey"
  | "Codex"
  | "ClaudeOAuth"
  | "IFlow";

// ============================================================================
// Flow 类型和状态
// ============================================================================

/**
 * Flow 类型
 */
export type FlowType =
  | "ChatCompletions"
  | "AnthropicMessages"
  | "GeminiGenerateContent"
  | "Embeddings"
  | { Other: string };

/**
 * Flow 状态
 */
export type FlowState =
  | "Pending"
  | "Streaming"
  | "Completed"
  | "Failed"
  | "Cancelled";

/**
 * 消息角色
 */
export type MessageRole = "system" | "user" | "assistant" | "tool" | "function";

/**
 * 停止原因
 */
export type StopReason =
  | "stop"
  | "length"
  | "tool_calls"
  | "content_filter"
  | "function_call"
  | "end_turn"
  | { other: string };

// ============================================================================
// 清理相关类型
// ============================================================================

/**
 * 清理类型
 */
export type CleanupType =
  | "All"
  | "ByTime"
  | "ByCount"
  | "ByStatus"
  | "ByProvider"
  | "BySize";

/**
 * 清理 Flow 请求参数
 */
export interface CleanupFlowsRequest {
  /** 清理类型 */
  cleanup_type: CleanupType;
  /** 保留天数（清理此天数之前的数据）- 仅当 cleanup_type 为 ByTime 时使用 */
  retention_days?: number;
  /** 保留小时数（清理此小时数之前的数据）- 仅当 cleanup_type 为 ByTime 时使用 */
  retention_hours?: number;
  /** 保留的最大记录数 - 仅当 cleanup_type 为 ByCount 时使用 */
  max_records?: number;
  /** 要清理的状态列表 - 仅当 cleanup_type 为 ByStatus 时使用 */
  target_states?: string[];
  /** 要清理的 Provider 列表 - 仅当 cleanup_type 为 ByProvider 时使用 */
  target_providers?: string[];
  /** 最大存储大小（字节）- 仅当 cleanup_type 为 BySize 时使用 */
  max_storage_bytes?: number;
}

/**
 * 清理结果
 */
export interface CleanupFlowsResponse {
  /** 清理的 Flow 数量 */
  cleaned_count: number;
  /** 清理的文件数量 */
  cleaned_files: number;
  /** 释放的空间（字节） */
  freed_bytes: number;
}

/**
 * 错误类型
 */
export type FlowErrorType =
  | "network"
  | "timeout"
  | "authentication"
  | "rate_limit"
  | "content_filter"
  | "server_error"
  | "bad_request"
  | "model_unavailable"
  | "token_limit_exceeded"
  | "other";

// ============================================================================
// 消息内容类型
// ============================================================================

/**
 * 图片 URL
 */
export interface ImageUrl {
  url: string;
  detail?: string;
}

/**
 * 内容部分（多模态消息）
 */
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: ImageUrl }
  | { type: "image"; media_type?: string; data?: string; url?: string };

/**
 * 消息内容
 */
export type MessageContent = string | ContentPart[];

/**
 * 工具调用
 */
export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * 工具结果
 */
export interface ToolResult {
  tool_call_id: string;
  content: string;
  is_error: boolean;
}

/**
 * 消息
 */
export interface Message {
  role: MessageRole;
  content: MessageContent;
  tool_calls?: ToolCall[];
  tool_result?: ToolResult;
  name?: string;
}

// ============================================================================
// 请求和响应类型
// ============================================================================

/**
 * 工具定义
 */
export interface ToolDefinition {
  type: string;
  function: {
    name: string;
    description?: string;
    parameters?: unknown;
  };
}

/**
 * 请求参数
 */
export interface RequestParameters {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  stream: boolean;
  [key: string]: unknown;
}

/**
 * LLM 请求
 */
export interface LLMRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
  messages: Message[];
  system_prompt?: string;
  tools?: ToolDefinition[];
  model: string;
  original_model?: string;
  parameters: RequestParameters;
  size_bytes: number;
  timestamp: string;
}

/**
 * 思维链内容
 */
export interface ThinkingContent {
  text: string;
  tokens?: number;
  signature?: string;
}

/**
 * Token 使用统计
 */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  thinking_tokens?: number;
  total_tokens: number;
}

/**
 * 流式响应信息
 */
export interface StreamInfo {
  chunk_count: number;
  first_chunk_latency_ms: number;
  avg_chunk_interval_ms: number;
  raw_chunks?: StreamChunk[];
}

/**
 * 流式 Chunk
 */
export interface StreamChunk {
  index: number;
  event?: string;
  data: string;
  timestamp: string;
  content_delta?: string;
  tool_call_delta?: ToolCallDelta;
  thinking_delta?: string;
}

/**
 * 工具调用增量
 */
export interface ToolCallDelta {
  index: number;
  id?: string;
  function_name?: string;
  arguments_delta?: string;
}

/**
 * LLM 响应
 */
export interface LLMResponse {
  status_code: number;
  status_text: string;
  headers: Record<string, string>;
  body: unknown;
  content: string;
  thinking?: ThinkingContent;
  tool_calls: ToolCall[];
  usage: TokenUsage;
  stop_reason?: StopReason;
  size_bytes: number;
  timestamp_start: string;
  timestamp_end: string;
  stream_info?: StreamInfo;
}

// ============================================================================
// 元数据类型
// ============================================================================

/**
 * 客户端信息
 */
export interface ClientInfo {
  ip?: string;
  user_agent?: string;
  request_id?: string;
}

/**
 * 路由信息
 */
export interface RoutingInfo {
  target_url?: string;
  route_rule?: string;
  load_balance_strategy?: string;
}

/**
 * Flow 元数据
 */
export interface FlowMetadata {
  provider: ProviderType;
  credential_id?: string;
  credential_name?: string;
  retry_count: number;
  client_info: ClientInfo;
  routing_info: RoutingInfo;
  injected_params?: Record<string, unknown>;
  context_usage_percentage?: number;
}

/**
 * 时间戳集合
 */
export interface FlowTimestamps {
  created: string;
  request_start: string;
  request_end?: string;
  response_start?: string;
  response_end?: string;
  duration_ms: number;
  ttfb_ms?: number;
}

/**
 * 用户标注
 */
export interface FlowAnnotations {
  marker?: string;
  comment?: string;
  tags: string[];
  starred: boolean;
}

/**
 * Flow 错误
 */
export interface FlowError {
  error_type: FlowErrorType;
  message: string;
  status_code?: number;
  raw_response?: string;
  timestamp: string;
  retryable: boolean;
}

// ============================================================================
// 核心 Flow 类型
// ============================================================================

/**
 * LLM Flow
 */
export interface LLMFlow {
  id: string;
  flow_type: FlowType;
  request: LLMRequest;
  response?: LLMResponse;
  error?: FlowError;
  metadata: FlowMetadata;
  timestamps: FlowTimestamps;
  state: FlowState;
  annotations: FlowAnnotations;
}

// ============================================================================
// 过滤和查询类型
// ============================================================================

/**
 * 时间范围
 */
export interface TimeRange {
  start?: string;
  end?: string;
}

/**
 * Token 范围
 */
export interface TokenRange {
  min?: number;
  max?: number;
}

/**
 * 延迟范围
 */
export interface LatencyRange {
  min_ms?: number;
  max_ms?: number;
}

/**
 * Flow 过滤器
 */
export interface FlowFilter {
  time_range?: TimeRange;
  providers?: ProviderType[];
  models?: string[];
  states?: FlowState[];
  has_error?: boolean;
  has_tool_calls?: boolean;
  has_thinking?: boolean;
  is_streaming?: boolean;
  content_search?: string;
  request_search?: string;
  token_range?: TokenRange;
  latency_range?: LatencyRange;
  tags?: string[];
  starred_only?: boolean;
  credential_id?: string;
  flow_types?: FlowType[];
  filter_expression?: string;
}

/**
 * 排序字段
 */
export type FlowSortBy =
  | "created_at"
  | "duration"
  | "total_tokens"
  | "content_length"
  | "model";

/**
 * 查询结果
 */
export interface FlowQueryResult {
  flows: LLMFlow[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * 搜索结果
 */
export interface FlowSearchResult {
  id: string;
  created_at: string;
  model: string;
  provider: string;
  snippet: string;
  score: number;
}

// ============================================================================
// 统计类型
// ============================================================================

/**
 * 按提供商统计
 */
export interface ProviderStats {
  provider: string;
  count: number;
  success_rate: number;
  avg_latency_ms: number;
}

/**
 * 按模型统计
 */
export interface ModelStats {
  model: string;
  count: number;
  success_rate: number;
  avg_latency_ms: number;
}

/**
 * 按状态统计
 */
export interface StateStats {
  state: string;
  count: number;
}

/**
 * Flow 统计信息
 */
export interface FlowStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  by_provider: ProviderStats[];
  by_model: ModelStats[];
  by_state: StateStats[];
}

// ============================================================================
// 导出类型
// ============================================================================

/**
 * 导出格式
 */
export type ExportFormat = "har" | "json" | "jsonl" | "markdown" | "csv";

/**
 * 代码导出格式
 */
export type CodeExportFormat = "curl" | "python" | "typescript" | "javascript";

/**
 * 脱敏规则
 */
export interface RedactionRule {
  name: string;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

/**
 * 导出选项
 */
export interface ExportOptions {
  format: ExportFormat;
  filter?: FlowFilter;
  include_raw?: boolean;
  include_stream_chunks?: boolean;
  redact_sensitive?: boolean;
  redaction_rules?: RedactionRule[];
  compress?: boolean;
}

/**
 * 导出结果
 */
export interface ExportResult {
  data: string;
  filename: string;
  mime_type: string;
}

// ============================================================================
// 标注更新类型
// ============================================================================

/**
 * 标注更新请求
 */
export interface UpdateAnnotationsRequest {
  starred?: boolean;
  marker?: string | null;
  comment?: string | null;
  tags?: string[];
  add_tags?: string[];
  remove_tags?: string[];
}

// ============================================================================
// 实时事件类型
// ============================================================================

/**
 * Flow 摘要（用于事件）
 */
export interface FlowSummary {
  id: string;
  flow_type: FlowType;
  state: FlowState;
  model: string;
  provider: ProviderType;
  created_at: string;
  duration_ms: number;
  input_tokens?: number;
  output_tokens?: number;
  has_error: boolean;
  has_tool_calls: boolean;
  has_thinking: boolean;
  content_preview?: string;
  chunk_count?: number;
}

/**
 * Flow 更新（用于事件）
 */
export interface FlowUpdate {
  state?: FlowState;
  content_delta?: string;
  thinking_delta?: string;
  tool_call_delta?: ToolCallDelta;
  chunk_count?: number;
}

/**
 * Flow 事件
 */
export type FlowEvent =
  | { type: "FlowStarted"; flow: FlowSummary }
  | { type: "FlowUpdated"; id: string; update: FlowUpdate }
  | { type: "FlowCompleted"; id: string; summary: FlowSummary }
  | { type: "FlowFailed"; id: string; error: FlowError }
  | { type: "ThresholdWarning"; id: string; result: ThresholdCheckResult };

/**
 * 阈值检测结果（用于事件）
 */
export interface ThresholdCheckResult {
  /** 是否超过延迟阈值 */
  latency_exceeded: boolean;
  /** 是否超过 Token 阈值 */
  token_exceeded: boolean;
  /** 是否超过输入 Token 阈值 */
  input_token_exceeded: boolean;
  /** 是否超过输出 Token 阈值 */
  output_token_exceeded: boolean;
  /** 实际延迟（毫秒） */
  actual_latency_ms: number;
  /** 实际 Token 使用量 */
  actual_tokens: number;
  /** 实际输入 Token */
  actual_input_tokens: number;
  /** 实际输出 Token */
  actual_output_tokens: number;
}

// ============================================================================
// 内部辅助函数
// ============================================================================

/**
 * 获取导出格式的文件扩展名
 */
function getFormatExtension(format: ExportFormat): string {
  const extMap: Record<ExportFormat, string> = {
    json: "json",
    jsonl: "jsonl",
    har: "har",
    markdown: "md",
    csv: "csv",
  };
  return extMap[format] || "txt";
}

/**
 * 获取导出格式的 MIME 类型
 */
function getFormatMimeType(format: ExportFormat): string {
  const mimeMap: Record<ExportFormat, string> = {
    json: "application/json",
    jsonl: "application/x-ndjson",
    har: "application/json",
    markdown: "text/markdown",
    csv: "text/csv",
  };
  return mimeMap[format] || "text/plain";
}

// ============================================================================
// API 接口
// ============================================================================

/**
 * Flow Monitor API
 *
 * 提供与后端 Flow Monitor 服务交互的所有方法
 */
export const flowMonitorApi = {
  /**
   * 查询 Flow 列表
   */
  async queryFlows(
    filter: FlowFilter = {},
    sortBy: FlowSortBy = "created_at",
    sortDesc: boolean = true,
    page: number = 1,
    pageSize: number = 20
  ): Promise<FlowQueryResult> {
    // 如果有 filter_expression，使用表达式查询
    if (filter.filter_expression) {
      return managementApi.post("/flow-monitor/query-expression", {
        filter_expr: filter.filter_expression,
        sort_by: sortBy,
        sort_desc: sortDesc,
        page,
        page_size: pageSize,
      });
    }

    // 否则使用普通查询
    const { filter_expression: _filterExpr, ...cleanFilter } = filter;
    return managementApi.post("/flow-monitor/query", {
      filter: cleanFilter,
      sort_by: sortBy,
      sort_desc: sortDesc,
      page,
      page_size: pageSize,
    });
  },

  /**
   * 获取单个 Flow 的详细信息
   */
  async getFlowDetail(id: string): Promise<LLMFlow | null> {
    return managementApi.get(`/flow-monitor/flows/${id}`);
  },

  /**
   * 全文搜索 Flow
   */
  async searchFlows(
    query: string,
    limit: number = 50
  ): Promise<FlowSearchResult[]> {
    return managementApi.post("/flow-monitor/search", { query, limit });
  },

  /**
   * 获取 Flow 统计信息
   */
  async getFlowStats(filter: FlowFilter = {}): Promise<FlowStats> {
    return managementApi.post("/flow-monitor/stats", { filter });
  },

  /**
   * 导出 Flow
   */
  async exportFlows(options: ExportOptions): Promise<ExportResult> {
    const response = await managementApi.post<{
      data: string;
      count: number;
      format: ExportFormat;
    }>("/flow-monitor/export", {
      format: options.format,
      filter: options.filter,
      include_raw: options.include_raw ?? true,
      include_stream_chunks: options.include_stream_chunks ?? false,
      redact_sensitive: options.redact_sensitive ?? false,
      flow_ids: null,
    });

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = getFormatExtension(options.format);
    const filename = `flows_${timestamp}.${ext}`;
    const mimeType = getFormatMimeType(options.format);

    return {
      data: response.data,
      filename,
      mime_type: mimeType,
    };
  },

  /**
   * 更新 Flow 标注
   */
  async updateFlowAnnotations(
    id: string,
    request: UpdateAnnotationsRequest
  ): Promise<FlowAnnotations> {
    return managementApi.put(`/flow-monitor/flows/${id}/annotations`, {
      starred: request.starred,
      marker: request.marker,
      comment: request.comment,
      tags: request.tags ?? [],
    });
  },

  /**
   * 清理 Flow 数据
   */
  async cleanupFlows(
    request: CleanupFlowsRequest
  ): Promise<CleanupFlowsResponse> {
    return managementApi.post("/flow-monitor/cleanup", request);
  },

  /**
   * 获取最近的 Flow 列表
   */
  async getRecentFlows(limit: number = 20): Promise<LLMFlow[]> {
    return managementApi.get(`/flow-monitor/recent?limit=${limit}`);
  },

  /**
   * 切换 Flow 收藏状态
   */
  async toggleFlowStar(id: string): Promise<boolean> {
    return managementApi.post(`/flow-monitor/flows/${id}/toggle-star`);
  },

  /**
   * 为 Flow 添加标签
   */
  async addFlowTags(id: string, tags: string[]): Promise<string[]> {
    return managementApi.post(`/flow-monitor/flows/${id}/tags`, { tags });
  },

  /**
   * 从 Flow 移除标签
   */
  async removeFlowTags(id: string, tags: string[]): Promise<string[]> {
    return managementApi.delete(`/flow-monitor/flows/${id}/tags?tags=${tags.join(",")}`);
  },

  /**
   * 设置 Flow 评论
   */
  async setFlowComment(
    id: string,
    comment: string | null
  ): Promise<string | null> {
    return managementApi.put(`/flow-monitor/flows/${id}/comment`, { comment });
  },

  /**
   * 设置 Flow 标记
   */
  async setFlowMarker(
    id: string,
    marker: string | null
  ): Promise<string | null> {
    return managementApi.put(`/flow-monitor/flows/${id}/marker`, { marker });
  },

  /**
   * 获取所有可用的标签
   */
  async getAllTags(): Promise<string[]> {
    return managementApi.get("/flow-monitor/tags");
  },

  /**
   * 批量导出 Flow
   */
  async exportFlowsByIds(
    ids: string[],
    options: Omit<ExportOptions, "filter">
  ): Promise<ExportResult> {
    const response = await managementApi.post<{
      data: string;
      count: number;
      format: ExportFormat;
    }>("/flow-monitor/export", {
      format: options.format,
      filter: null,
      include_raw: options.include_raw ?? true,
      include_stream_chunks: options.include_stream_chunks ?? false,
      redact_sensitive: options.redact_sensitive ?? false,
      flow_ids: ids,
    });

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = getFormatExtension(options.format);
    const filename = `flows_${timestamp}.${ext}`;
    const mimeType = getFormatMimeType(options.format);

    return {
      data: response.data,
      filename,
      mime_type: mimeType,
    };
  },

  /**
   * 删除 Flow
   */
  async deleteFlow(id: string): Promise<boolean> {
    return managementApi.delete(`/flow-monitor/flows/${id}`);
  },

  /**
   * 批量删除 Flow
   */
  async deleteFlows(ids: string[]): Promise<number> {
    return managementApi.post("/flow-monitor/delete-batch", { ids });
  },

  /**
   * 获取 Flow Monitor 调试信息
   */
  async getFlowMonitorDebugInfo(): Promise<{
    enabled: boolean;
    active_flow_count: number;
    memory_flow_count: number;
    max_memory_flows: number;
    memory_flow_ids: string[];
    config_enabled: boolean;
  }> {
    return managementApi.get("/flow-monitor/debug");
  },

  /**
   * 创建测试 Flow 数据（仅用于调试）
   */
  async createTestFlows(count?: number): Promise<number> {
    return managementApi.post("/flow-monitor/test-flows", { count });
  },
};

// ============================================================================
// 导出的辅助函数
// ============================================================================

/**
 * 格式化 Flow 状态为中文
 */
export function formatFlowState(state: FlowState): string {
  const stateMap: Record<FlowState, string> = {
    Pending: "等待中",
    Streaming: "流式传输中",
    Completed: "已完成",
    Failed: "失败",
    Cancelled: "已取消",
  };
  return stateMap[state] || state;
}

/**
 * 格式化 Flow 类型为中文
 */
export function formatFlowType(flowType: FlowType): string {
  if (typeof flowType === "string") {
    const typeMap: Record<string, string> = {
      ChatCompletions: "聊天补全",
      AnthropicMessages: "Anthropic 消息",
      GeminiGenerateContent: "Gemini 生成",
      Embeddings: "嵌入",
    };
    return typeMap[flowType] || flowType;
  }
  return flowType.Other;
}

/**
 * 格式化错误类型为中文
 */
export function formatErrorType(errorType: FlowErrorType): string {
  const errorMap: Record<FlowErrorType, string> = {
    network: "网络错误",
    timeout: "超时",
    authentication: "认证错误",
    rate_limit: "速率限制",
    content_filter: "内容过滤",
    server_error: "服务器错误",
    bad_request: "请求错误",
    model_unavailable: "模型不可用",
    token_limit_exceeded: "Token 限制超出",
    other: "其他错误",
  };
  return errorMap[errorType] || errorType;
}

/**
 * 格式化 Token 数量
 */
export function formatTokenCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * 格式化延迟时间
 */
export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${ms}ms`;
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

/**
 * 获取消息内容的纯文本
 */
export function getMessageText(content: MessageContent): string {
  if (typeof content === "string") {
    return content;
  }
  return content
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("\n");
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * 创建默认过滤器
 */
export function createDefaultFilter(): FlowFilter {
  return {
    starred_only: false,
  };
}

/**
 * 创建时间范围过滤器
 */
export function createTimeRangeFilter(
  hours: number
): Pick<FlowFilter, "time_range"> {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  return {
    time_range: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  };
}

/**
 * 合并过滤器
 */
export function mergeFilters(...filters: FlowFilter[]): FlowFilter {
  return filters.reduce((acc, filter) => ({ ...acc, ...filter }), {});
}

// ============================================================================
// 增强统计类型
// ============================================================================

/**
 * 时间序列数据点
 */
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

/**
 * 分布数据
 */
export interface Distribution {
  buckets: [string, number][];
  total: number;
}

/**
 * 趋势数据
 */
export interface TrendData {
  points: TimeSeriesPoint[];
  interval: string;
}

/**
 * 统计时间范围
 */
export interface StatsTimeRange {
  start: string;
  end: string;
}

/**
 * 增强统计结果
 */
export interface EnhancedStats {
  request_trend: TrendData;
  token_by_model: Distribution;
  success_by_provider: [string, number][];
  latency_histogram: Distribution;
  error_distribution: Distribution;
  request_rate: number;
  time_range: StatsTimeRange;
}

/**
 * 报告格式
 */
export type ReportFormat = "json" | "markdown" | "csv";

/**
 * 增强统计 API
 */
export const enhancedStatsApi = {
  /**
   * 获取增强统计
   */
  async getEnhancedStats(
    filter: FlowFilter = {},
    timeRange?: StatsTimeRange
  ): Promise<EnhancedStats> {
    const now = new Date();
    const defaultTimeRange: StatsTimeRange = {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end: now.toISOString(),
    };
    return managementApi.post("/flow-monitor/enhanced-stats", {
      filter,
      time_range: timeRange || defaultTimeRange,
    });
  },

  /**
   * 获取请求趋势
   */
  async getRequestTrend(
    filter: FlowFilter = {},
    timeRange?: StatsTimeRange,
    interval: string = "1h"
  ): Promise<TrendData> {
    const now = new Date();
    const defaultTimeRange: StatsTimeRange = {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end: now.toISOString(),
    };
    return managementApi.post("/flow-monitor/request-trend", {
      filter,
      time_range: timeRange || defaultTimeRange,
      interval,
    });
  },

  /**
   * 获取 Token 分布
   */
  async getTokenDistribution(
    filter: FlowFilter = {},
    timeRange?: StatsTimeRange
  ): Promise<Distribution> {
    const now = new Date();
    const defaultTimeRange: StatsTimeRange = {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end: now.toISOString(),
    };
    return managementApi.post("/flow-monitor/token-distribution", {
      filter,
      time_range: timeRange || defaultTimeRange,
    });
  },

  /**
   * 获取延迟直方图
   */
  async getLatencyHistogram(
    filter: FlowFilter = {},
    timeRange?: StatsTimeRange,
    buckets: number[] = [100, 500, 1000, 2000, 5000, 10000]
  ): Promise<Distribution> {
    const now = new Date();
    const defaultTimeRange: StatsTimeRange = {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end: now.toISOString(),
    };
    return managementApi.post("/flow-monitor/latency-histogram", {
      filter,
      time_range: timeRange || defaultTimeRange,
      buckets,
    });
  },

  /**
   * 导出统计报告
   */
  async exportStatsReport(
    filter: FlowFilter = {},
    timeRange?: StatsTimeRange,
    format: ReportFormat = "json"
  ): Promise<string> {
    const now = new Date();
    const defaultTimeRange: StatsTimeRange = {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end: now.toISOString(),
    };
    return managementApi.post("/flow-monitor/export-report", {
      filter,
      time_range: timeRange || defaultTimeRange,
      format,
    });
  },
};

export default flowMonitorApi;

// ============================================================================
// 实时监控增强类型
// ============================================================================

/**
 * 阈值配置
 */
export interface ThresholdConfig {
  /** 是否启用阈值检测 */
  enabled: boolean;
  /** 延迟阈值（毫秒） */
  latency_threshold_ms: number;
  /** Token 使用量阈值 */
  token_threshold: number;
  /** 输入 Token 阈值（可选） */
  input_token_threshold?: number;
  /** 输出 Token 阈值（可选） */
  output_token_threshold?: number;
}

/**
 * 请求速率响应
 */
export interface RequestRateResponse {
  /** 请求速率（每秒） */
  rate: number;
  /** 时间窗口内的请求数量 */
  count: number;
  /** 时间窗口（秒） */
  window_seconds: number;
}

/**
 * 实时监控增强 API
 */
export const realtimeMonitorApi = {
  /**
   * 获取阈值配置
   */
  async getThresholdConfig(): Promise<ThresholdConfig> {
    return managementApi.get("/flow-monitor/threshold-config");
  },

  /**
   * 更新阈值配置
   */
  async updateThresholdConfig(config: ThresholdConfig): Promise<void> {
    return managementApi.put("/flow-monitor/threshold-config", config);
  },

  /**
   * 获取请求速率
   */
  async getRequestRate(): Promise<RequestRateResponse> {
    return managementApi.get("/flow-monitor/request-rate");
  },

  /**
   * 设置请求速率追踪器的时间窗口
   */
  async setRateWindow(windowSeconds: number): Promise<void> {
    return managementApi.put("/flow-monitor/rate-window", {
      window_seconds: windowSeconds,
    });
  },
};
