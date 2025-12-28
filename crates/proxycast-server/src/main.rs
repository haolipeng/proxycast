//! ProxyCast 独立服务器
//!
//! 提供网页 UI + 本地服务模式，无需 Tauri 桌面框架
//!
//! 功能：
//! - 代理 API（/v1/chat/completions, /v1/messages 等）
//! - 管理 API（/api/management/*）
//! - 静态文件服务（Web UI）

use clap::Parser;
use proxycast_api::{create_app, ApiConfig, AppState as ManagementState};
use proxycast_core::{
    config::{load_config, Config},
    database,
    logger::LogStore,
    server::ServerState,
    services::{provider_pool_service::ProviderPoolService, token_cache_service::TokenCacheService},
};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/// ProxyCast 独立服务器
#[derive(Parser, Debug)]
#[command(name = "proxycast-server")]
#[command(author, version, about = "ProxyCast AI API Proxy Server", long_about = None)]
struct Args {
    /// 监听地址
    #[arg(short = 'H', long)]
    host: Option<String>,

    /// 监听端口
    #[arg(short, long)]
    port: Option<u16>,

    /// 配置文件路径
    #[arg(short, long)]
    config: Option<String>,

    /// 静态文件目录
    #[arg(long, default_value = "./web/dist")]
    static_dir: String,

    /// 禁用静态文件服务
    #[arg(long)]
    no_static: bool,

    /// 日志级别
    #[arg(long, default_value = "info")]
    log_level: String,

    /// 仅启动管理 API（不启动代理服务器）
    #[arg(long)]
    management_only: bool,

    /// 管理 API 端口（默认与代理端口相同）
    #[arg(long)]
    management_port: Option<u16>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();

    // 初始化日志
    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&args.log_level));

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(env_filter)
        .init();

    tracing::info!("ProxyCast Server v{}", env!("CARGO_PKG_VERSION"));

    // 加载配置
    let mut config = load_config().map_err(|e| {
        tracing::error!("Failed to load config: {}", e);
        e
    })?;

    // 命令行参数覆盖配置（仅在显式指定时）
    if let Some(host) = &args.host {
        config.server.host = host.clone();
    }
    if let Some(port) = args.port {
        config.server.port = port;
    }

    // 安全检查
    validate_config(&config)?;

    // 初始化数据库
    let db = database::init_database().map_err(|e| {
        tracing::error!("Failed to initialize database: {}", e);
        format!("Database error: {}", e)
    })?;

    tracing::info!("Database initialized");

    // 初始化共享服务
    let logs = Arc::new(RwLock::new(LogStore::new()));
    let pool_service = Arc::new(ProviderPoolService::new());
    let token_cache = Arc::new(TokenCacheService::new());

    // 启动管理 API 服务器（包含静态文件服务和所有 API）
    let management_port = args.management_port.unwrap_or(config.server.port);

    // 创建管理 API 状态
    let management_state = ManagementState::new(config.clone(), db.clone())?;

    // 创建 API 配置
    let api_config = ApiConfig {
        serve_static: !args.no_static,
        static_dir: args.static_dir.clone(),
        enable_cors: true,
        management_api_prefix: "/api/management".to_string(),
    };

    // 创建管理 API 应用
    let app = create_app(management_state, api_config);

    // 启动管理 API 服务器
    let addr: SocketAddr = format!("{}:{}", config.server.host, management_port).parse()?;

    tracing::info!("Starting ProxyCast Server on {}", addr);
    if !args.no_static {
        tracing::info!("  Web UI: http://{}", addr);
    }
    tracing::info!("  Management API: http://{}/api/management", addr);
    tracing::info!("  Proxy API: http://{}/v1/chat/completions", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("Server shutdown complete");

    Ok(())
}

/// 验证配置
fn validate_config(config: &Config) -> Result<(), String> {
    // 检查是否为本地监听
    let host = &config.server.host;
    let is_local = host == "127.0.0.1"
        || host == "localhost"
        || host == "::1"
        || host.starts_with("192.168.")
        || host.starts_with("10.")
        || host.starts_with("172.");

    if !is_local {
        tracing::warn!(
            "Server is configured to listen on non-local address: {}",
            host
        );
        tracing::warn!("This may expose your API keys to the network!");
    }

    // 检查 API Key
    if config.server.api_key == proxycast_core::config::DEFAULT_API_KEY {
        tracing::warn!("Using default API key. Please configure a secure key in production.");
    }

    Ok(())
}

/// 等待关闭信号
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received Ctrl+C, shutting down...");
        }
        _ = terminate => {
            tracing::info!("Received terminate signal, shutting down...");
        }
    }
}
