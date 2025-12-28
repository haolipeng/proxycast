//! Provider Pool 管理 API
//!
//! 凭证池管理，包括凭证的增删改查、健康检查等

use axum::{
    extract::{Path, State},
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::error::ApiError;
use crate::state::AppState;
use proxycast_core::models::provider_pool_model::{get_credential_type, CredentialData};
use proxycast_core::ProviderType;

/// Provider 池概览
#[derive(Serialize)]
pub struct ProviderPoolOverviewResponse {
    pub provider_type: String,
    pub total_count: usize,
    pub active_count: usize,
    pub healthy_count: usize,
}

/// 凭证显示信息（API 响应）
#[derive(Serialize)]
pub struct CredentialDisplayResponse {
    pub uuid: String,
    pub name: Option<String>,
    pub provider_type: String,
    pub credential_type: String,
    pub is_healthy: bool,
    pub is_disabled: bool,
    pub usage_count: u64,
    pub last_used: Option<String>,
    pub created_at: String,
}

/// 添加凭证请求
#[derive(Deserialize)]
pub struct AddCredentialRequest {
    pub provider_type: String,
    pub credential: CredentialData,
    pub name: Option<String>,
    pub check_health: Option<bool>,
    pub check_model_name: Option<String>,
}

/// 更新凭证请求
#[derive(Deserialize)]
pub struct UpdateCredentialRequest {
    pub name: Option<String>,
    pub is_disabled: Option<bool>,
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/overview", get(get_overview))
        .route("/credentials/by-type/:provider_type", get(get_credentials))
        .route("/credentials", post(add_credential))
        .route("/credentials/:uuid", put(update_credential))
        .route("/credentials/:uuid", delete(delete_credential))
        .route("/credentials/:uuid/toggle", post(toggle_credential))
        .route("/credentials/:uuid/health", post(check_health))
}

/// 获取 Provider 池概览
async fn get_overview(
    State(state): State<AppState>,
) -> Result<Json<Vec<ProviderPoolOverviewResponse>>, ApiError> {
    let overview = state
        .pool_service
        .get_overview(&state.db)
        .map_err(|e| ApiError::Database(e.to_string()))?;

    let result: Vec<ProviderPoolOverviewResponse> = overview
        .into_iter()
        .map(|o| ProviderPoolOverviewResponse {
            provider_type: o.provider_type.to_string(),
            total_count: o.stats.total_count,
            active_count: o.stats.total_count - o.stats.disabled_count,
            healthy_count: o.stats.healthy_count,
        })
        .collect();

    Ok(Json(result))
}

/// 获取指定 Provider 的凭证列表
async fn get_credentials(
    State(state): State<AppState>,
    Path(provider_type): Path<String>,
) -> Result<Json<Vec<CredentialDisplayResponse>>, ApiError> {
    let provider: ProviderType = provider_type
        .parse()
        .map_err(|e: String| ApiError::BadRequest(e))?;

    // 使用 get_overview 获取凭证列表
    let overview = state
        .pool_service
        .get_overview(&state.db)
        .map_err(|e| ApiError::Database(e.to_string()))?;

    // 找到对应 provider 的凭证
    let provider_str = provider.to_string();
    let credentials = overview
        .into_iter()
        .find(|o| o.provider_type.to_string() == provider_str)
        .map(|o| o.credentials)
        .unwrap_or_default();

    let result: Vec<CredentialDisplayResponse> = credentials
        .into_iter()
        .map(|c| CredentialDisplayResponse {
            uuid: c.uuid,
            name: c.name,
            provider_type: c.provider_type,
            credential_type: c.credential_type,
            is_healthy: c.is_healthy,
            is_disabled: c.is_disabled,
            usage_count: c.usage_count,
            last_used: c.last_used,
            created_at: c.created_at,
        })
        .collect();

    Ok(Json(result))
}

/// 添加凭证
async fn add_credential(
    State(state): State<AppState>,
    Json(request): Json<AddCredentialRequest>,
) -> Result<Json<CredentialDisplayResponse>, ApiError> {
    let _provider: ProviderType = request
        .provider_type
        .parse()
        .map_err(|e: String| ApiError::BadRequest(e))?;

    // 调用 pool_service 添加凭证
    let credential = state
        .pool_service
        .add_credential(
            &state.db,
            &request.provider_type,
            request.credential,
            request.name,
            request.check_health,
            request.check_model_name,
        )
        .map_err(|e| ApiError::Database(e))?;

    // 转换为响应格式
    Ok(Json(CredentialDisplayResponse {
        uuid: credential.uuid,
        name: credential.name,
        provider_type: credential.provider_type.to_string(),
        credential_type: get_credential_type(&credential.credential),
        is_healthy: credential.is_healthy,
        is_disabled: credential.is_disabled,
        usage_count: credential.usage_count,
        last_used: credential.last_used.map(|dt| dt.to_rfc3339()),
        created_at: credential.created_at.to_rfc3339(),
    }))
}

/// 更新凭证
async fn update_credential(
    State(_state): State<AppState>,
    Path(_uuid): Path<String>,
    Json(_request): Json<UpdateCredentialRequest>,
) -> Result<Json<CredentialDisplayResponse>, ApiError> {
    // TODO: 实现更新凭证逻辑
    Err(ApiError::Internal("Not implemented yet".to_string()))
}

/// 删除凭证
async fn delete_credential(
    State(_state): State<AppState>,
    Path(_uuid): Path<String>,
) -> Result<Json<bool>, ApiError> {
    // TODO: 实现删除凭证逻辑
    Err(ApiError::Internal("Not implemented yet".to_string()))
}

/// 切换凭证启用状态
async fn toggle_credential(
    State(_state): State<AppState>,
    Path(_uuid): Path<String>,
) -> Result<Json<bool>, ApiError> {
    // TODO: 实现切换凭证状态逻辑
    Err(ApiError::Internal("Not implemented yet".to_string()))
}

/// 检查凭证健康状态
async fn check_health(
    State(_state): State<AppState>,
    Path(_uuid): Path<String>,
) -> Result<Json<bool>, ApiError> {
    // TODO: 实现健康检查逻辑
    Err(ApiError::Internal("Not implemented yet".to_string()))
}
