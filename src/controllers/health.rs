use axum::{
    Json, Router, debug_handler,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post},
};
use serde_json::json;

use crate::{
    AppContext, Result,
    models::{
        dto::records::{NewHealthRecord, UpdateHealthRecord},
        health::{HealthRecord, HealthRecordsQuery},
        users::User,
    },
};

#[debug_handler]
async fn all(
    user: User,
    State(ctx): State<AppContext>,
    Query(conditions): Query<HealthRecordsQuery<'static>>,
) -> Result<Response> {
    let models = HealthRecord::find_all(&ctx.db, user.organisation_pid, &conditions).await?;

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

#[debug_handler]
async fn update(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateHealthRecord<'static>>,
) -> Result<Response> {
    let model = HealthRecord::update_by_id(&ctx.db, id, user.organisation_pid, &params).await?;

    Ok((StatusCode::CREATED, Json(model)).into_response())
}

#[debug_handler]
async fn remove(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let _result = HealthRecord::delete_by_id(&ctx.db, user.organisation_pid, id).await?;

    Ok((StatusCode::NO_CONTENT, Json(json!({}).to_string())).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/", post(add))
        .route("/{id}", get(one))
        .route("/{id}", patch(update))
        .route("/{id}", delete(remove))
        .with_state(ctx)
}
