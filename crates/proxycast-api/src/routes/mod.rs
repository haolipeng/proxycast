//! 管理 API 路由
//!
//! 将 Tauri commands 转换为 HTTP API 路由

pub mod config;
pub mod flow_monitor;
pub mod provider_pool;
pub mod resilience;
pub mod router;
pub mod server;
pub mod telemetry;

use axum::Router;
use crate::state::AppState;

/// 创建管理 API 路由
pub fn management_routes() -> Router<AppState> {
    Router::new()
        .nest("/server", server::routes())
        .nest("/config", config::routes())
        .nest("/provider-pool", provider_pool::routes())
        .nest("/telemetry", telemetry::routes())
        .nest("/flow-monitor", flow_monitor::routes())
        .nest("/router", router::routes())
        .nest("/resilience", resilience::routes())
}
