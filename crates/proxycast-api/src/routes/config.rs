//! 配置管理 API

use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::error::ApiError;
use crate::state::AppState;

/// 服务器配置
#[derive(Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub api_key: String,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/server", get(get_server_config))
        .route("/server", post(update_server_config))
}

/// 获取服务器配置
async fn get_server_config(State(state): State<AppState>) -> Result<Json<ServerConfig>, ApiError> {
    let config = state.config.read().await;

    Ok(Json(ServerConfig {
        host: config.server.host.clone(),
        port: config.server.port,
        api_key: config.server.api_key.clone(),
    }))
}

/// 更新服务器配置
async fn update_server_config(
    State(state): State<AppState>,
    Json(new_config): Json<ServerConfig>,
) -> Result<Json<ServerConfig>, ApiError> {
    let mut config = state.config.write().await;

    config.server.host = new_config.host.clone();
    config.server.port = new_config.port;
    config.server.api_key = new_config.api_key.clone();

    Ok(Json(new_config))
}
