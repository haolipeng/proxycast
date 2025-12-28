/**
 * Tauri invoke 兼容层
 *
 * 提供与 Tauri invoke 相同的接口，但使用 HTTP API 实现
 * 用于逐步迁移现有代码
 */

import { managementApi } from './client';

// 命令到 API 路径的映射
const commandMap: Record<string, { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string }> = {
  // Server
  'get_server_status': { method: 'GET', path: '/server/status' },

  // Provider Pool
  'get_provider_pool_overview': { method: 'GET', path: '/provider-pool/overview' },
  'get_provider_pool_credentials': { method: 'GET', path: '/provider-pool/credentials/{providerType}' },
  'add_provider_pool_credential': { method: 'POST', path: '/provider-pool/credentials' },
  'update_provider_pool_credential': { method: 'PUT', path: '/provider-pool/credentials/{uuid}' },
  'delete_provider_pool_credential': { method: 'DELETE', path: '/provider-pool/credentials/{uuid}' },
  'toggle_provider_pool_credential': { method: 'POST', path: '/provider-pool/credentials/{uuid}/toggle' },
  'check_provider_pool_credential_health': { method: 'POST', path: '/provider-pool/credentials/{uuid}/health' },

  // Config
  'get_server_config': { method: 'GET', path: '/config/server' },
  'update_server_config': { method: 'POST', path: '/config/server' },

  // Telemetry
  'get_telemetry_stats': { method: 'GET', path: '/telemetry/stats' },
  'reset_telemetry_stats': { method: 'POST', path: '/telemetry/stats/reset' },

  // Flow Monitor
  'get_flow_list': { method: 'GET', path: '/flow-monitor/flows' },
  'get_flow_detail': { method: 'GET', path: '/flow-monitor/flows/{id}' },
  'delete_flow': { method: 'DELETE', path: '/flow-monitor/flows/{id}' },
  'clear_flows': { method: 'POST', path: '/flow-monitor/flows/clear' },

  // Router
  'get_router_rules': { method: 'GET', path: '/router/rules' },
  'add_router_rule': { method: 'POST', path: '/router/rules' },
  'update_router_rule': { method: 'PUT', path: '/router/rules/{id}' },
  'delete_router_rule': { method: 'DELETE', path: '/router/rules/{id}' },

  // Resilience
  'get_resilience_config': { method: 'GET', path: '/resilience/config' },
  'update_resilience_config': { method: 'POST', path: '/resilience/config' },
};

/**
 * 模拟 Tauri invoke 接口
 *
 * @param cmd 命令名称
 * @param args 命令参数
 * @returns Promise<T>
 */
export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const mapping = commandMap[cmd];

  if (!mapping) {
    console.warn(`Unknown command: ${cmd}, falling back to direct API call`);
    // 尝试将命令名转换为 API 路径
    const path = `/${cmd.replace(/_/g, '-')}`;
    return managementApi.post(path, args);
  }

  let path = mapping.path;

  // 替换路径参数
  if (args) {
    for (const [key, value] of Object.entries(args)) {
      const placeholder = `{${key}}`;
      if (path.includes(placeholder)) {
        path = path.replace(placeholder, String(value));
        delete args[key]; // 从 body 中移除已用于路径的参数
      }
    }
  }

  // 根据方法类型调用 API
  switch (mapping.method) {
    case 'GET':
      // GET 请求将参数作为查询字符串
      if (args && Object.keys(args).length > 0) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(args)) {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        }
        path = `${path}?${params.toString()}`;
      }
      return managementApi.get(path);

    case 'POST':
      return managementApi.post(path, args);

    case 'PUT':
      return managementApi.put(path, args);

    case 'DELETE':
      return managementApi.delete(path);

    default:
      throw new Error(`Unknown method: ${mapping.method}`);
  }
}

export default invoke;
