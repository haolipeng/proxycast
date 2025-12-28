//! 路由规则 API

use axum::{
    extract::{Path, State},
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::error::ApiError;
use crate::state::AppState;

/// 路由规则
#[derive(Serialize, Deserialize)]
pub struct RouterRule {
    pub id: String,
    pub name: String,
    pub source_model: String,
    pub target_provider: String,
    pub target_model: String,
    pub priority: i32,
    pub is_active: bool,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/rules", get(list_rules))
        .route("/rules", post(add_rule))
        .route("/rules/:id", get(get_rule))
        .route("/rules/:id", put(update_rule))
        .route("/rules/:id", delete(delete_rule))
}

/// 获取路由规则列表
async fn list_rules(State(_state): State<AppState>) -> Result<Json<Vec<RouterRule>>, ApiError> {
    // TODO: 实现获取路由规则列表
    Ok(Json(vec![]))
}

/// 添加路由规则
async fn add_rule(
    State(_state): State<AppState>,
    Json(_rule): Json<RouterRule>,
) -> Result<Json<RouterRule>, ApiError> {
    // TODO: 实现添加路由规则
    Err(ApiError::Internal("Not implemented yet".to_string()))
}

/// 获取单个路由规则
async fn get_rule(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
) -> Result<Json<RouterRule>, ApiError> {
    // TODO: 实现获取路由规则
    Err(ApiError::NotFound("Rule not found".to_string()))
}

/// 更新路由规则
async fn update_rule(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
    Json(_rule): Json<RouterRule>,
) -> Result<Json<RouterRule>, ApiError> {
    // TODO: 实现更新路由规则
    Err(ApiError::Internal("Not implemented yet".to_string()))
}

/// 删除路由规则
async fn delete_rule(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
) -> Result<Json<bool>, ApiError> {
    // TODO: 实现删除路由规则
    Ok(Json(true))
}
