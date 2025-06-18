use axum::{
    Json, Router, debug_handler,
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
};
use serde::{Deserialize, Serialize};

use crate::{
    AppContext, Result,
    models::{
        animals::{Animal, AnimalResponse},
        health::{HealthRecord, HealthRecordResponse},
        livestock::LivestockSummary,
        users::User,
    },
};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardResponse {
    pub livestock: Vec<AnimalResponse>,
    pub health: Vec<HealthRecordResponse>,
    pub livestock_summary: Vec<LivestockSummary>,
}

#[debug_handler]
async fn metrics(user: User, State(ctx): State<AppContext>) -> Result<Response> {
    let livestock = Animal::find_most_valuable(&ctx.db, user.organisation_pid).await?;
    let health = HealthRecord::find_recent_activities(&ctx.db, user.organisation_pid).await?;
    let livestock_summary = LivestockSummary::find_all(&ctx.db, user.organisation_pid).await?;

    Ok((
        StatusCode::OK,
        Json(DashboardResponse {
            livestock,
            health,
            livestock_summary,
        }),
    )
        .into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new().route("/", get(metrics)).with_state(ctx)
}
