//! ProxyCast Core Library
//!
//! 核心库包含所有不依赖 Tauri 的业务逻辑：
//! - AI Provider 实现
//! - HTTP API 服务器
//! - 数据库操作
//! - 配置管理
//! - 流量监控
//! - 路由和弹性处理

// 核心模块
pub mod config;
pub mod converter;
pub mod credential;
pub mod database;
pub mod flow_monitor;
pub mod injection;
pub mod logger;
pub mod middleware;
pub mod models;
pub mod plugin;
pub mod processor;
pub mod providers;
pub mod proxy;
pub mod resilience;
pub mod router;
pub mod server;
pub mod server_utils;
pub mod services;
pub mod streaming;
pub mod telemetry;
pub mod websocket;

use serde::{Deserialize, Serialize};

/// AI Provider 类型枚举
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProviderType {
    Kiro,
    Gemini,
    Qwen,
    #[serde(rename = "openai")]
    OpenAI,
    Claude,
    Antigravity,
    Vertex,
    /// Gemini API Key (multi-account load balancing)
    #[serde(rename = "gemini_api_key")]
    GeminiApiKey,
    /// Codex (OpenAI OAuth)
    Codex,
    /// Claude OAuth (Anthropic OAuth)
    #[serde(rename = "claude_oauth")]
    ClaudeOAuth,
    /// iFlow
    #[serde(rename = "iflow")]
    IFlow,
}

impl std::fmt::Display for ProviderType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProviderType::Kiro => write!(f, "kiro"),
            ProviderType::Gemini => write!(f, "gemini"),
            ProviderType::Qwen => write!(f, "qwen"),
            ProviderType::OpenAI => write!(f, "openai"),
            ProviderType::Claude => write!(f, "claude"),
            ProviderType::Antigravity => write!(f, "antigravity"),
            ProviderType::Vertex => write!(f, "vertex"),
            ProviderType::GeminiApiKey => write!(f, "gemini_api_key"),
            ProviderType::Codex => write!(f, "codex"),
            ProviderType::ClaudeOAuth => write!(f, "claude_oauth"),
            ProviderType::IFlow => write!(f, "iflow"),
        }
    }
}

impl std::str::FromStr for ProviderType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "kiro" => Ok(ProviderType::Kiro),
            "gemini" => Ok(ProviderType::Gemini),
            "qwen" => Ok(ProviderType::Qwen),
            "openai" => Ok(ProviderType::OpenAI),
            "claude" => Ok(ProviderType::Claude),
            "antigravity" => Ok(ProviderType::Antigravity),
            "vertex" => Ok(ProviderType::Vertex),
            "gemini_api_key" => Ok(ProviderType::GeminiApiKey),
            "codex" => Ok(ProviderType::Codex),
            "claude_oauth" => Ok(ProviderType::ClaudeOAuth),
            "iflow" => Ok(ProviderType::IFlow),
            _ => Err(format!("Invalid provider: {s}")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_provider_type_from_str() {
        assert_eq!("kiro".parse::<ProviderType>().unwrap(), ProviderType::Kiro);
        assert_eq!(
            "gemini".parse::<ProviderType>().unwrap(),
            ProviderType::Gemini
        );
        assert_eq!("qwen".parse::<ProviderType>().unwrap(), ProviderType::Qwen);
        assert_eq!(
            "openai".parse::<ProviderType>().unwrap(),
            ProviderType::OpenAI
        );
        assert_eq!(
            "claude".parse::<ProviderType>().unwrap(),
            ProviderType::Claude
        );
        assert_eq!(
            "vertex".parse::<ProviderType>().unwrap(),
            ProviderType::Vertex
        );
        assert_eq!(
            "gemini_api_key".parse::<ProviderType>().unwrap(),
            ProviderType::GeminiApiKey
        );

        // 测试大小写不敏感
        assert_eq!("KIRO".parse::<ProviderType>().unwrap(), ProviderType::Kiro);
        assert_eq!(
            "Gemini".parse::<ProviderType>().unwrap(),
            ProviderType::Gemini
        );
        assert_eq!(
            "VERTEX".parse::<ProviderType>().unwrap(),
            ProviderType::Vertex
        );

        // 测试无效的 provider
        assert!("invalid".parse::<ProviderType>().is_err());
    }

    #[test]
    fn test_provider_type_display() {
        assert_eq!(ProviderType::Kiro.to_string(), "kiro");
        assert_eq!(ProviderType::Gemini.to_string(), "gemini");
        assert_eq!(ProviderType::Qwen.to_string(), "qwen");
        assert_eq!(ProviderType::OpenAI.to_string(), "openai");
        assert_eq!(ProviderType::Claude.to_string(), "claude");
        assert_eq!(ProviderType::Vertex.to_string(), "vertex");
        assert_eq!(ProviderType::GeminiApiKey.to_string(), "gemini_api_key");
    }

    #[test]
    fn test_provider_type_serde() {
        // 测试序列化
        assert_eq!(
            serde_json::to_string(&ProviderType::Kiro).unwrap(),
            "\"kiro\""
        );
        assert_eq!(
            serde_json::to_string(&ProviderType::OpenAI).unwrap(),
            "\"openai\""
        );

        // 测试反序列化
        assert_eq!(
            serde_json::from_str::<ProviderType>("\"kiro\"").unwrap(),
            ProviderType::Kiro
        );
        assert_eq!(
            serde_json::from_str::<ProviderType>("\"openai\"").unwrap(),
            ProviderType::OpenAI
        );
    }
}
