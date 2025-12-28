//! 应用状态管理
//!
//! 替代 Tauri 的状态管理，提供统一的应用状态
//!
//! 注意：这是一个简化版本，完整实现需要参考 src-tauri/src/lib.rs 中的初始化逻辑

use proxycast_core::{
    config::Config,
    database::DbConnection,
    services::provider_pool_service::ProviderPoolService,
};
use std::sync::Arc;
use tokio::sync::RwLock;

/// 统一的应用状态
///
/// 替代 Tauri 的分散状态管理
#[derive(Clone)]
pub struct AppState {
    // 核心配置
    pub config: Arc<RwLock<Config>>,

    // 数据库连接
    pub db: DbConnection,

    // Provider Pool 服务
    pub pool_service: Arc<ProviderPoolService>,
}

impl AppState {
    /// 创建新的应用状态
    pub fn new(config: Config, db: DbConnection) -> Result<Self, String> {
        // 初始化 Provider Pool 服务
        let pool_service = Arc::new(ProviderPoolService::new());

        Ok(Self {
            config: Arc::new(RwLock::new(config)),
            db,
            pool_service,
        })
    }
}
