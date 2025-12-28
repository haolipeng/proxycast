/**
 * Browser Interceptor API
 *
 * 桌面特有功能（需要系统级代理），Web 版提供空实现
 */

// 类型定义
export interface InterceptorState {
  enabled: boolean;
  active_hooks: string[];
  intercepted_count: number;
  last_activity?: string;
  can_restore: boolean;
}

export interface InterceptedUrl {
  id: string;
  url: string;
  source_process: string;
  timestamp: string;
  copied: boolean;
  opened_in_browser: boolean;
  dismissed: boolean;
}

export interface FingerprintBrowserConfig {
  enabled: boolean;
  executable_path: string;
  profile_path: string;
  additional_args: string[];
}

export interface RecoveryConfig {
  backup_system_state: boolean;
  emergency_recovery_hotkey: string;
  auto_recovery_on_crash: boolean;
  recovery_timeout: number;
}

export interface BrowserInterceptorConfig {
  enabled: boolean;
  target_processes: string[];
  url_patterns: string[];
  excluded_processes: string[];
  notification_enabled: boolean;
  auto_copy_to_clipboard: boolean;
  restore_on_exit: boolean;
  temporary_disable_timeout?: number | null;
  auto_launch_browser: boolean;
  fingerprint_browser: FingerprintBrowserConfig;
  recovery: RecoveryConfig;
}

export interface InterceptorStatistics {
  total_intercepted: number;
  current_intercepted: number;
  copied_count: number;
  opened_count: number;
  dismissed_count: number;
}

const NOT_AVAILABLE_ERROR = "Browser interceptor is not available in web version";

// API 函数
export const browserInterceptorApi = {
  // 获取拦截器状态
  async getState(): Promise<InterceptorState | null> {
    return {
      enabled: false,
      active_hooks: [],
      intercepted_count: 0,
      can_restore: false,
    };
  },

  // 启动拦截器
  async start(_config: BrowserInterceptorConfig): Promise<string> {
    throw new Error(NOT_AVAILABLE_ERROR);
  },

  // 停止拦截器
  async stop(): Promise<string> {
    return "Already stopped";
  },

  // 恢复正常浏览器行为
  async restoreNormalBehavior(): Promise<string> {
    return "Already restored";
  },

  // 临时禁用拦截器
  async temporaryDisable(_durationSeconds: number): Promise<string> {
    return "Not available in web version";
  },

  // 获取拦截的 URL 列表
  async getInterceptedUrls(): Promise<InterceptedUrl[]> {
    return [];
  },

  // 获取历史记录
  async getHistory(_limit?: number): Promise<InterceptedUrl[]> {
    return [];
  },

  // 复制 URL 到剪贴板
  async copyUrlToClipboard(_urlId: string): Promise<string> {
    throw new Error(NOT_AVAILABLE_ERROR);
  },

  // 在指纹浏览器中打开 URL
  async openInFingerprintBrowser(_urlId: string): Promise<string> {
    throw new Error(NOT_AVAILABLE_ERROR);
  },

  // 忽略 URL
  async dismissUrl(_urlId: string): Promise<string> {
    throw new Error(NOT_AVAILABLE_ERROR);
  },

  // 更新配置
  async updateConfig(_config: BrowserInterceptorConfig): Promise<string> {
    throw new Error(NOT_AVAILABLE_ERROR);
  },

  // 获取默认配置
  async getDefaultConfig(): Promise<BrowserInterceptorConfig> {
    return {
      enabled: false,
      target_processes: [],
      url_patterns: [],
      excluded_processes: [],
      notification_enabled: false,
      auto_copy_to_clipboard: false,
      restore_on_exit: true,
      temporary_disable_timeout: null,
      auto_launch_browser: false,
      fingerprint_browser: {
        enabled: false,
        executable_path: "",
        profile_path: "",
        additional_args: [],
      },
      recovery: {
        backup_system_state: false,
        emergency_recovery_hotkey: "",
        auto_recovery_on_crash: false,
        recovery_timeout: 0,
      },
    };
  },

  // 验证配置
  async validateConfig(_config: BrowserInterceptorConfig): Promise<string> {
    return "Valid";
  },

  // 检查是否正在运行
  async isRunning(): Promise<boolean> {
    return false;
  },

  // 获取统计信息
  async getStatistics(): Promise<InterceptorStatistics> {
    return {
      total_intercepted: 0,
      current_intercepted: 0,
      copied_count: 0,
      opened_count: 0,
      dismissed_count: 0,
    };
  },

  // 通知相关函数
  async showNotification(
    _title: string,
    _body: string,
    _icon?: string
  ): Promise<string> {
    return "Notifications not supported in web version";
  },

  async showUrlInterceptNotification(
    _url: string,
    _sourceProcess: string
  ): Promise<string> {
    return "Notifications not supported in web version";
  },

  async showStatusNotification(
    _message: string,
    _notificationType: string
  ): Promise<string> {
    return "Notifications not supported in web version";
  },
};

// 导出便捷函数
export const getBrowserInterceptorState = () =>
  browserInterceptorApi.getState();
export const startBrowserInterceptor = (config: BrowserInterceptorConfig) =>
  browserInterceptorApi.start(config);
export const stopBrowserInterceptor = () => browserInterceptorApi.stop();
export const restoreNormalBrowserBehavior = () =>
  browserInterceptorApi.restoreNormalBehavior();
export const temporaryDisableInterceptor = (durationSeconds: number) =>
  browserInterceptorApi.temporaryDisable(durationSeconds);
export const getInterceptedUrls = () =>
  browserInterceptorApi.getInterceptedUrls();
export const getInterceptorHistory = (limit?: number) =>
  browserInterceptorApi.getHistory(limit);
export const copyInterceptedUrlToClipboard = (urlId: string) =>
  browserInterceptorApi.copyUrlToClipboard(urlId);
export const openUrlInFingerprintBrowser = (urlId: string) =>
  browserInterceptorApi.openInFingerprintBrowser(urlId);
export const dismissInterceptedUrl = (urlId: string) =>
  browserInterceptorApi.dismissUrl(urlId);
export const updateBrowserInterceptorConfig = (
  config: BrowserInterceptorConfig
) => browserInterceptorApi.updateConfig(config);
export const getDefaultBrowserInterceptorConfig = () =>
  browserInterceptorApi.getDefaultConfig();
export const validateBrowserInterceptorConfig = (
  config: BrowserInterceptorConfig
) => browserInterceptorApi.validateConfig(config);
export const isBrowserInterceptorRunning = () =>
  browserInterceptorApi.isRunning();
export const getBrowserInterceptorStatistics = () =>
  browserInterceptorApi.getStatistics();

// 通知函数导出
export const showBrowserInterceptorNotification = (
  title: string,
  body: string,
  icon?: string
) => browserInterceptorApi.showNotification(title, body, icon);
export const showUrlInterceptNotification = (
  url: string,
  sourceProcess: string
) => browserInterceptorApi.showUrlInterceptNotification(url, sourceProcess);
export const showBrowserInterceptorStatusNotification = (
  message: string,
  type: string
) => browserInterceptorApi.showStatusNotification(message, type);
