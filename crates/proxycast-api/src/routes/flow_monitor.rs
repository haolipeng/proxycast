//! 流量监控 API

use axum::{
    extract::{Path, Query, State},
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::error::ApiError;
use crate::state::AppState;

/// Flow 查询参数
#[derive(Deserialize)]
pub struct FlowQuery {
    pub page: Option<u32>,
    pub page_size: Option<u32>,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub status: Option<String>,
}

/// Flow 摘要
#[derive(Serialize)]
pub struct FlowSummary {
    pub id: String,
    pub provider: String,
    pub model: String,
    pub status: String,
    pub input_tokens: u32,
    pub output_tokens: u32,
    pub duration_ms: u64,
    pub created_at: String,
}

/// Flow 列表响应
#[derive(Serialize)]
pub struct FlowListResponse {
    pub flows: Vec<FlowSummary>,
    pub total: u64,
    pub page: u32,
    pub page_size: u32,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/flows", get(list_flows))
        .route("/flows/:id", get(get_flow))
        .route("/flows/:id", delete(delete_flow))
        .route("/flows/clear", post(clear_flows))
}

/// 获取 Flow 列表
async fn list_flows(
    State(_state): State<AppState>,
    Query(query): Query<FlowQuery>,
) -> Result<Json<FlowListResponse>, ApiError> {
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(20);

    // TODO: 实现完整的查询逻辑
    Ok(Json(FlowListResponse {
        flows: vec![],
        total: 0,
        page,
        page_size,
    }))
}

/// 获取单个 Flow 详情
async fn get_flow(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // TODO: 实现获取 Flow 详情
    Err(ApiError::NotFound("Flow not found".to_string()))
}

/// 删除 Flow
async fn delete_flow(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
) -> Result<Json<bool>, ApiError> {
    // TODO: 实现删除 Flow
    Ok(Json(true))
}

/// 清空所有 Flow
async fn clear_flows(State(_state): State<AppState>) -> Result<Json<bool>, ApiError> {
    // TODO: 实现清空 Flow
    Ok(Json(true))
}
