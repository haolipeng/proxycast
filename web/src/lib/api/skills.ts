/**
 * Skills API
 *
 * HTTP 客户端实现，替代 Tauri invoke 调用
 */

import { managementApi } from "./client";

export interface Skill {
  key: string;
  name: string;
  description: string;
  directory: string;
  readmeUrl?: string;
  installed: boolean;
  repoOwner?: string;
  repoName?: string;
  repoBranch?: string;
}

export interface SkillRepo {
  owner: string;
  name: string;
  branch: string;
  enabled: boolean;
}

export type AppType = "claude" | "codex" | "gemini";

export const skillsApi = {
  async getAll(app: AppType = "claude"): Promise<Skill[]> {
    return managementApi.get(`/skills/${app}`);
  },

  async install(directory: string, app: AppType = "claude"): Promise<boolean> {
    return managementApi.post(`/skills/${app}/install`, { directory });
  },

  async uninstall(
    directory: string,
    app: AppType = "claude",
  ): Promise<boolean> {
    return managementApi.post(`/skills/${app}/uninstall`, { directory });
  },

  async getRepos(): Promise<SkillRepo[]> {
    return managementApi.get("/skills/repos");
  },

  async addRepo(repo: SkillRepo): Promise<boolean> {
    return managementApi.post("/skills/repos", repo);
  },

  async removeRepo(owner: string, name: string): Promise<boolean> {
    return managementApi.delete(`/skills/repos/${owner}/${name}`);
  },
};
