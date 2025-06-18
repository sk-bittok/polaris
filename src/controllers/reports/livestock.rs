use axum::{
    Json, Router, debug_handler,
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
};

use crate::{
    AppContext, Result,
    models::{livestock::LivestockSummary, users::User},
};

#[debug_handler]
async fn all(State(ctx): State<AppContext>, user: User) -> Result<Response> {
    let reports = LivestockSummary::find_all(&ctx.db, user.organisation_pid).await?;

    Ok((StatusCode::OK, Json(reports)).into_response())
}

#[debug_handler]
async fn add(State(ctx): State<AppContext>, user: User) -> Result<Response> {
    let report = LivestockSummary::generate(&ctx.db, user.organisation_pid).await?;

    Ok((StatusCode::CREATED, Json(report)).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/", post(add))
        .with_state(ctx)
}
