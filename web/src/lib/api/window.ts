/**
 * 窗口控制 API
 *
 * 桌面特有功能，Web 版提供有限实现
 */

/**
 * 窗口大小
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * 窗口大小选项
 */
export interface WindowSizeOption {
  id: string;
  name: string;
  description: string;
  size: WindowSize;
}

/**
 * 窗口控制 API
 */
export const windowApi = {
  /**
   * 获取当前窗口大小
   */
  async getWindowSize(): Promise<WindowSize> {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },

  /**
   * 设置窗口大小
   * Web 版不支持
   */
  async setWindowSize(_size: WindowSize): Promise<void> {
    console.warn("Window resize is not available in web version");
  },

  /**
   * 获取所有可用的窗口大小选项
   */
  async getWindowSizeOptions(): Promise<WindowSizeOption[]> {
    return [
      {
        id: "compact",
        name: "紧凑",
        description: "紧凑模式",
        size: WindowSizes.compact,
      },
      {
        id: "default",
        name: "默认",
        description: "默认窗口大小",
        size: WindowSizes.default,
      },
      {
        id: "flow-monitor",
        name: "Flow Monitor",
        description: "Flow Monitor 优化大小",
        size: WindowSizes.flowMonitor,
      },
    ];
  },

  /**
   * 设置窗口为指定的预设大小
   * Web 版不支持
   */
  async setWindowSizeByOption(_optionId: string): Promise<WindowSize> {
    console.warn("Window resize is not available in web version");
    return await this.getWindowSize();
  },

  /**
   * 切换全屏模式
   */
  async toggleFullscreen(): Promise<boolean> {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return true;
    } else {
      await document.exitFullscreen();
      return false;
    }
  },

  /**
   * 检查是否处于全屏模式
   */
  async isFullscreen(): Promise<boolean> {
    return !!document.fullscreenElement;
  },

  /**
   * 切换到 Flow Monitor 优化大小
   * Web 版不支持
   */
  async resizeForFlowMonitor(): Promise<WindowSize> {
    console.warn("Window resize is not available in web version");
    return await this.getWindowSize();
  },

  /**
   * 恢复窗口到指定大小
   * Web 版不支持
   */
  async restoreWindowSize(_size: WindowSize): Promise<void> {
    console.warn("Window resize is not available in web version");
  },

  /**
   * 切换窗口大小
   * Web 版不支持
   */
  async toggleWindowSize(): Promise<boolean> {
    console.warn("Window resize is not available in web version");
    return false;
  },

  /**
   * 居中窗口
   * Web 版不支持
   */
  async centerWindow(): Promise<void> {
    console.warn("Window center is not available in web version");
  },
};

/**
 * 预定义的窗口大小
 */
export const WindowSizes = {
  /** 紧凑模式 */
  compact: { width: 1000, height: 700 } as WindowSize,

  /** 默认窗口大小 */
  default: { width: 1200, height: 800 } as WindowSize,

  /** Flow Monitor 优化大小 */
  flowMonitor: { width: 1600, height: 1000 } as WindowSize,

  /** 大屏模式 */
  large: { width: 1920, height: 1200 } as WindowSize,

  /** 超大屏模式 */
  extraLarge: { width: 2560, height: 1440 } as WindowSize,

  /** 超宽屏模式 */
  ultraWide: { width: 3440, height: 1440 } as WindowSize,

  /** 4K 模式 */
  fourK: { width: 3840, height: 2160 } as WindowSize,
};

export default windowApi;
