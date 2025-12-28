//! 弹性配置 API

use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::error::ApiError;
use crate::state::AppState;

/// 弹性配置
#[derive(Serialize, Deserialize)]
pub struct ResilienceConfig {
    /// 重试次数
    pub retry_count: u32,
    /// 重试延迟（毫秒）
    pub retry_delay_ms: u64,
    /// 超时时间（毫秒）
    pub timeout_ms: u64,
    /// 是否启用熔断
    pub circuit_breaker_enabled: bool,
    /// 熔断阈值
    pub circuit_breaker_threshold: u32,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/config", get(get_config))
        .route("/config", post(update_config))
}

/// 获取弹性配置
async fn get_config(State(_state): State<AppState>) -> Result<Json<ResilienceConfig>, ApiError> {
    // TODO: 从配置中读取弹性配置
    Ok(Json(ResilienceConfig {
        retry_count: 3,
        retry_delay_ms: 1000,
        timeout_ms: 30000,
        circuit_breaker_enabled: true,
        circuit_breaker_threshold: 5,
    }))
}

/// 更新弹性配置
async fn update_config(
    State(_state): State<AppState>,
    Json(config): Json<ResilienceConfig>,
) -> Result<Json<ResilienceConfig>, ApiError> {
    // TODO: 保存弹性配置
    Ok(Json(config))
}
