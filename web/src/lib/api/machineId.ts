/**
 * Machine ID API
 *
 * 桌面特有功能（需要系统级权限），Web 版提供存根实现
 */

// Machine ID types matching Rust backend

export type MachineIdFormat = "uuid" | "hex32" | "unknown";

export interface MachineIdInfo {
  current_id: string;
  original_id?: string;
  platform: string;
  can_modify: boolean;
  requires_admin: boolean;
  backup_exists: boolean;
  format_type: MachineIdFormat;
}

export interface MachineIdResult {
  success: boolean;
  message: string;
  requires_restart: boolean;
  requires_admin: boolean;
  new_machine_id?: string;
}

export interface AdminStatus {
  is_admin: boolean;
  platform: string;
  elevation_method?: string;
  check_success: boolean;
}

export interface MachineIdValidation {
  is_valid: boolean;
  error_message?: string;
  formatted_id?: string;
  detected_format: MachineIdFormat;
}

export interface MachineIdHistory {
  id: string;
  machine_id: string;
  timestamp: string;
  platform: string;
  backup_path?: string;
}

export interface SystemInfo {
  os: string;
  arch: string;
  family: string;
  machine_id_support: PlatformSupport;
  requires_admin: boolean;
}

export interface PlatformSupport {
  can_read: boolean;
  can_write: boolean;
  format: string;
  method: string;
  limitations: string[];
}

const NOT_AVAILABLE_ERROR = "Machine ID management is not available in web version";

export const machineIdApi = {
  /**
   * 获取当前机器码信息
   */
  async getCurrentMachineId(): Promise<MachineIdInfo> {
    return {
      current_id: "not-available-in-web",
      platform: "web",
      can_modify: false,
      requires_admin: true,
      backup_exists: false,
      format_type: "unknown",
    };
  },

  /**
   * 设置新的机器码
   */
  async setMachineId(_newId: string): Promise<MachineIdResult> {
    return {
      success: false,
      message: NOT_AVAILABLE_ERROR,
      requires_restart: false,
      requires_admin: true,
    };
  },

  /**
   * 生成随机机器码
   */
  async generateRandomMachineId(): Promise<string> {
    // Generate a random UUID in the browser
    return crypto.randomUUID();
  },

  /**
   * 验证机器码格式
   */
  async validateMachineId(machineId: string): Promise<MachineIdValidation> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hex32Regex = /^[0-9a-f]{32}$/i;

    if (uuidRegex.test(machineId)) {
      return {
        is_valid: true,
        formatted_id: machineId.toLowerCase(),
        detected_format: "uuid",
      };
    } else if (hex32Regex.test(machineId)) {
      return {
        is_valid: true,
        formatted_id: machineId.toLowerCase(),
        detected_format: "hex32",
      };
    } else {
      return {
        is_valid: false,
        error_message: "Invalid machine ID format",
        detected_format: "unknown",
      };
    }
  },

  /**
   * 检查管理员权限
   */
  async checkAdminPrivileges(): Promise<AdminStatus> {
    return {
      is_admin: false,
      platform: "web",
      check_success: true,
    };
  },

  /**
   * 获取操作系统类型
   */
  async getOsType(): Promise<string> {
    return "web";
  },

  /**
   * 备份机器码到文件
   */
  async backupMachineIdToFile(_filePath: string): Promise<boolean> {
    console.warn(NOT_AVAILABLE_ERROR);
    return false;
  },

  /**
   * 从文件恢复机器码
   */
  async restoreMachineIdFromFile(_filePath: string): Promise<MachineIdResult> {
    return {
      success: false,
      message: NOT_AVAILABLE_ERROR,
      requires_restart: false,
      requires_admin: true,
    };
  },

  /**
   * 格式化机器码
   * @param machineId 机器码
   * @param formatType 格式类型："uuid" 或 "hex32"
   */
  async formatMachineId(
    machineId: string,
    formatType: "uuid" | "hex32",
  ): Promise<string> {
    const cleaned = machineId.replace(/[-\s]/g, "").toLowerCase();
    if (formatType === "uuid" && cleaned.length === 32) {
      return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
    }
    return cleaned;
  },

  /**
   * 检测机器码格式
   */
  async detectMachineIdFormat(machineId: string): Promise<string> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hex32Regex = /^[0-9a-f]{32}$/i;

    if (uuidRegex.test(machineId)) return "uuid";
    if (hex32Regex.test(machineId)) return "hex32";
    return "unknown";
  },

  /**
   * 转换机器码格式
   * @param machineId 机器码
   * @param targetFormat 目标格式："uuid" 或 "hex32"
   */
  async convertMachineIdFormat(
    machineId: string,
    targetFormat: "uuid" | "hex32",
  ): Promise<string> {
    return this.formatMachineId(machineId, targetFormat);
  },

  /**
   * 获取机器码历史记录
   */
  async getMachineIdHistory(): Promise<MachineIdHistory[]> {
    return [];
  },

  /**
   * 清除机器码覆盖（仅限 macOS）
   */
  async clearMachineIdOverride(): Promise<MachineIdResult> {
    return {
      success: false,
      message: NOT_AVAILABLE_ERROR,
      requires_restart: false,
      requires_admin: true,
    };
  },

  /**
   * 复制机器码到剪贴板
   */
  async copyMachineIdToClipboard(machineId: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(machineId);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 从剪贴板粘贴机器码
   */
  async pasteMachineIdFromClipboard(): Promise<string> {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return "";
    }
  },

  /**
   * 获取系统信息
   */
  async getSystemInfo(): Promise<SystemInfo> {
    return {
      os: "web",
      arch: "unknown",
      family: "web",
      machine_id_support: {
        can_read: false,
        can_write: false,
        format: "unknown",
        method: "not-supported",
        limitations: ["Machine ID management is not available in web version"],
      },
      requires_admin: true,
    };
  },
};

// Helper functions for common operations
export const machineIdUtils = {
  /**
   * 检查机器码是否为有效的UUID格式
   */
  isValidUuid(machineId: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(machineId);
  },

  /**
   * 检查机器码是否为有效的32位十六进制格式
   */
  isValidHex32(machineId: string): boolean {
    const hex32Regex = /^[0-9a-f]{32}$/i;
    return hex32Regex.test(machineId);
  },

  /**
   * 清理机器码字符串（移除连字符和空格）
   */
  cleanMachineId(machineId: string): string {
    return machineId.replace(/[-\s]/g, "").toLowerCase();
  },

  /**
   * 格式化机器码为UUID格式
   */
  formatAsUuid(machineId: string): string {
    const cleaned = this.cleanMachineId(machineId);
    if (cleaned.length !== 32) {
      throw new Error("Invalid machine ID length");
    }
    return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
  },

  /**
   * 获取机器码的显示名称
   */
  getFormatDisplayName(format: MachineIdFormat): string {
    switch (format) {
      case "uuid":
        return "UUID格式";
      case "hex32":
        return "32位十六进制";
      case "unknown":
        return "未知格式";
      default:
        return "未知格式";
    }
  },

  /**
   * 获取平台的显示名称
   */
  getPlatformDisplayName(platform: string): string {
    switch (platform.toLowerCase()) {
      case "windows":
        return "Windows";
      case "macos":
        return "macOS";
      case "linux":
        return "Linux";
      default:
        return platform;
    }
  },
};
