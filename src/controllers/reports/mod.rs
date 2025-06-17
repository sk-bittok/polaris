#![allow(clippy::needless_pass_by_value)]

use std::sync::Arc;

use axum::Router;

use crate::AppContext;

pub mod category;

pub fn router(ctx: Arc<AppContext>) -> Router {
    Router::new().nest("/categories", category::router((*ctx).clone()))
}
