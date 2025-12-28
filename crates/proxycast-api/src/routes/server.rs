//! 服务器状态 API
//!
//! 提供服务器状态查询功能

use axum::{
    extract::State,
    routing::get,
    Json, Router,
};
use serde::Serialize;

use crate::error::ApiError;
use crate::state::AppState;

/// 服务器状态响应
#[derive(Serialize)]
pub struct ServerStatus {
    pub running: bool,
    pub host: String,
    pub port: u16,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/status", get(get_status))
}

/// 获取服务器状态
async fn get_status(State(state): State<AppState>) -> Result<Json<ServerStatus>, ApiError> {
    let config = state.config.read().await;

    Ok(Json(ServerStatus {
        running: true, // 如果能响应请求，说明服务器在运行
        host: config.server.host.clone(),
        port: config.server.port,
    }))
}
