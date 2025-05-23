use axum::{
    Json, Router, debug_handler,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
};

use crate::{
    AppContext, Result,
    models::{dto::records::NewHealthRecord, health_records::HealthRecord, users::User},
};

#[debug_handler]
async fn all(user: User, State(ctx): State<AppContext>) -> Result<Response> {
    let models = HealthRecord::find_all(&ctx.db, user.organisation_pid).await?;

    Ok((StatusCode::OK, Json(models)).into_response())
}

#[debug_handler]
async fn add(
    user: User,
    State(ctx): State<AppContext>,
    Json(params): Json<NewHealthRecord<'static>>,
) -> Result<Response> {
    let model = HealthRecord::create(&ctx.db, &params, user.organisation_pid, user.pid).await?;

    Ok((StatusCode::CREATED, Json(model)).into_response())
}

#[debug_handler]
async fn one(user: User, State(ctx): State<AppContext>, Path(id): Path<i32>) -> Result<Response> {
    let model = HealthRecord::find_by_id(&ctx.db, id, user.organisation_pid).await?;

    Ok((StatusCode::OK, Json(model)).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/", post(add))
        .route("/{id}", get(one))
        .with_state(ctx)
}
