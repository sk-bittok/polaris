#![allow(clippy::needless_pass_by_value)]

use std::sync::Arc;

use axum::Router;

use crate::AppContext;

pub mod breeds;
pub mod category;
pub mod livestock;

pub fn router(ctx: Arc<AppContext>) -> Router {
    Router::new()
        .nest("/categories", category::router((*ctx).clone()))
        .nest("/breeds", breeds::router((*ctx).clone()))
        .nest("/livestock", livestock::router((*ctx).clone()))
}
