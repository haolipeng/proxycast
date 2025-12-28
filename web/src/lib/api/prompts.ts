/**
 * Prompts API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

export interface Prompt {
  id: string;
  app_type: string;
  name: string;
  content: string;
  description?: string;
  enabled: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type AppType = "claude" | "codex" | "gemini";

export const promptsApi = {
  /** Get all prompts as a map (id -> Prompt) */
  getPrompts: (app: AppType): Promise<Record<string, Prompt>> =>
    managementApi.get(`/prompts/${app}`),

  /** Upsert a prompt (insert or update) */
  upsertPrompt: (app: AppType, id: string, prompt: Prompt): Promise<void> =>
    managementApi.put(`/prompts/${app}/${id}`, prompt),

  /** Add a new prompt */
  addPrompt: (prompt: Prompt): Promise<void> =>
    managementApi.post(`/prompts/${prompt.app_type}`, prompt),

  /** Update an existing prompt */
  updatePrompt: (prompt: Prompt): Promise<void> =>
    managementApi.put(`/prompts/${prompt.app_type}/${prompt.id}`, prompt),

  /** Delete a prompt */
  deletePrompt: (app: AppType, id: string): Promise<void> =>
    managementApi.delete(`/prompts/${app}/${id}`),

  /** Enable a prompt and sync to live file */
  enablePrompt: (app: AppType, id: string): Promise<void> =>
    managementApi.post(`/prompts/${app}/${id}/enable`),

  /** Import prompt from live file */
  importFromFile: (app: AppType): Promise<string> =>
    managementApi.post(`/prompts/${app}/import`),

  /** Get current live prompt file content */
  getCurrentFileContent: (app: AppType): Promise<string | null> =>
    managementApi.get(`/prompts/${app}/live-content`),

  /** Auto-import from live file if no prompts exist */
  autoImport: (app: AppType): Promise<number> =>
    managementApi.post(`/prompts/${app}/auto-import`),

  // Legacy API for compatibility
  switchPrompt: (appType: AppType, id: string): Promise<void> =>
    managementApi.post(`/prompts/${appType}/${id}/switch`),
};
