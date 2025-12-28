//! ProxyCast Management API Layer
//!
//! 将 Tauri commands 转换为 HTTP API 路由，
//! 提供 RESTful 接口供前端调用。

pub mod error;
pub mod middleware;
pub mod routes;
pub mod state;

use axum::Router;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

// Re-exports
pub use error::ApiError;
pub use state::AppState;

/// API 配置
pub struct ApiConfig {
    /// 是否服务静态文件
    pub serve_static: bool,
    /// 静态文件目录
    pub static_dir: String,
    /// 是否启用 CORS
    pub enable_cors: bool,
    /// 管理 API 前缀
    pub management_api_prefix: String,
}

impl Default for ApiConfig {
    fn default() -> Self {
        Self {
            serve_static: true,
            static_dir: "./web/dist".to_string(),
            enable_cors: true,
            management_api_prefix: "/api/management".to_string(),
        }
    }
}

/// 创建完整的应用路由
///
/// 包含：
/// - 代理 API（/v1/chat/completions, /v1/messages 等）
/// - 管理 API（/api/management/*）
/// - 静态文件服务（可选）
pub fn create_app(state: AppState, config: ApiConfig) -> Router {
    let mut app = Router::new();

    // 管理 API 路由
    let management_routes = routes::management_routes();
    app = app.nest(&config.management_api_prefix, management_routes);

    // 添加 CORS 中间件
    if config.enable_cors {
        let cors = CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any);
        app = app.layer(cors);
    }

    // 静态文件服务（SPA fallback）
    if config.serve_static {
        app = app.fallback_service(ServeDir::new(&config.static_dir));
    }

    app.with_state(state)
}
