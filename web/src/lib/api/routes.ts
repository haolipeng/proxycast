/**
 * Routes API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

export interface RouteEndpoint {
  path: string;
  protocol: string;
  url: string;
}

export interface RouteInfo {
  selector: string;
  provider_type: string;
  credential_count: number;
  endpoints: RouteEndpoint[];
  tags: string[];
  enabled: boolean;
}

export interface RouteListResponse {
  base_url: string;
  default_provider: string;
  routes: RouteInfo[];
}

export interface CurlExample {
  description: string;
  command: string;
}

export const routesApi = {
  async getAvailableRoutes(): Promise<RouteListResponse> {
    return managementApi.get("/routes");
  },

  async getCurlExamples(selector: string): Promise<CurlExample[]> {
    return managementApi.get(`/routes/${encodeURIComponent(selector)}/curl-examples`);
  },
};
