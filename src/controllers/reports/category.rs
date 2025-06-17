use axum::{
    Json, Router, debug_handler,
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
};
use serde::{Deserialize, Serialize};

use crate::{
    AppContext, Result,
    models::{SpecieSummary, users::User},
};

#[derive(Debug, Deserialize, Serialize, Clone)]
struct CategoryReportQuery {
    specie: String,
}

#[debug_handler]
async fn add(
    State(ctx): State<AppContext>,
    user: User,
    Query(params): Query<CategoryReportQuery>,
) -> Result<Response> {
    let report = SpecieSummary::generate(&ctx.db, user.organisation_pid, &params.specie).await?;

    Ok((StatusCode::CREATED, Json(report)).into_response())
}

#[debug_handler]
async fn all(
    State(ctx): State<AppContext>,
    user: User,
    Query(params): Query<CategoryReportQuery>,
) -> Result<Response> {
    let report = SpecieSummary::find_all(&ctx.db, user.organisation_pid, &params.specie).await?;

    Ok((StatusCode::OK, Json(report)).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/", post(add))
        .with_state(ctx)
}
