/**
 * MCP API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

export interface McpServer {
  id: string;
  name: string;
  server_config: {
    command: string;
    args?: string[];
    env?: Record<string, string>;
  };
  description?: string;
  enabled_proxycast: boolean;
  enabled_claude: boolean;
  enabled_codex: boolean;
  enabled_gemini: boolean;
  created_at?: number;
}

export const mcpApi = {
  getServers: (): Promise<McpServer[]> => managementApi.get("/mcp/servers"),

  addServer: (server: McpServer): Promise<void> =>
    managementApi.post("/mcp/servers", server),

  updateServer: (server: McpServer): Promise<void> =>
    managementApi.put(`/mcp/servers/${server.id}`, server),

  deleteServer: (id: string): Promise<void> =>
    managementApi.delete(`/mcp/servers/${id}`),

  toggleServer: (
    id: string,
    appType: string,
    enabled: boolean,
  ): Promise<void> =>
    managementApi.post(`/mcp/servers/${id}/toggle`, { app_type: appType, enabled }),

  /** 从外部应用导入 MCP 配置 */
  importFromApp: (appType: string): Promise<number> =>
    managementApi.post(`/mcp/import/${appType}`),

  /** 同步所有 MCP 配置到实际配置文件 */
  syncAllToLive: (): Promise<void> => managementApi.post("/mcp/sync-all"),
};
