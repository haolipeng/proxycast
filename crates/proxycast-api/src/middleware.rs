//! API 中间件

use axum::{
    extract::Request,
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
};

/// API Key 认证中间件
pub async fn auth_middleware(request: Request, next: Next) -> Result<Response, StatusCode> {
    // 从请求头获取 API Key
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    // 检查 Bearer token
    if let Some(auth) = auth_header {
        if auth.starts_with("Bearer ") {
            // TODO: 验证 API Key
            // 目前暂时允许所有请求通过
            return Ok(next.run(request).await);
        }
    }

    // 对于本地访问，暂时允许无认证
    // 生产环境应该强制认证
    Ok(next.run(request).await)
}
