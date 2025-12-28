//! 遥测统计 API

use axum::{
    routing::get,
    Json, Router,
};
use serde::Serialize;

use crate::error::ApiError;
use crate::state::AppState;

/// 统计摘要
#[derive(Serialize)]
pub struct StatsSummary {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub total_tokens: u64,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/stats", get(get_stats))
}

/// 获取统计数据
async fn get_stats() -> Result<Json<StatsSummary>, ApiError> {
    // TODO: 实现完整的统计逻辑
    Ok(Json(StatsSummary {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        total_tokens: 0,
    }))
}
