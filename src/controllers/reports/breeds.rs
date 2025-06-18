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
    models::{BreedSummary, BreedSummaryQuery, users::User},
};

#[derive(Debug, Deserialize, Clone, Serialize)]
struct GenerateReport {
    breed: String,
    specie: String,
}

#[debug_handler]
async fn add(
    State(ctx): State<AppContext>,
    user: User,
    Query(params): Query<GenerateReport>,
) -> Result<Response> {
    let generated = BreedSummary::generate(
        &ctx.db,
        user.organisation_pid,
        &params.breed,
        &params.specie,
    )
    .await?;

    Ok((StatusCode::CREATED, Json(generated)).into_response())
}

#[debug_handler]
async fn all(
    State(ctx): State<AppContext>,
    user: User,
    Query(params): Query<BreedSummaryQuery>,
) -> Result<Response> {
    let reports = BreedSummary::find_list(&ctx.db, user.organisation_pid, &params).await?;

    Ok((StatusCode::OK, Json(reports)).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", post(add))
        .route("/", get(all))
        .with_state(ctx)
}
