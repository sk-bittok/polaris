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
        dto::records::{NewWeightRecord, UpdateWeightRecord},
        users::User,
        weight::{WeightQuery, WeightRecord},
    },
};

#[debug_handler]
async fn all(
    user: User,
    State(ctx): State<AppContext>,
    Query(conditions): Query<WeightQuery>,
) -> Result<Response> {
    let models = WeightRecord::find_all(&ctx.db, user.organisation_pid, &conditions).await?;

    Ok((StatusCode::OK, Json(models)).into_response())
}

#[debug_handler]
async fn add(
    user: User,
    State(ctx): State<AppContext>,
    Json(params): Json<NewWeightRecord<'static>>,
) -> Result<Response> {
    let model = WeightRecord::create(&ctx.db, &params, user.organisation_pid, user.pid).await?;

    Ok((StatusCode::CREATED, Json(model)).into_response())
}

#[debug_handler]
async fn one(user: User, State(ctx): State<AppContext>, Path(id): Path<i32>) -> Result<Response> {
    let model = WeightRecord::find_by_id(&ctx.db, user.organisation_pid, id).await?;

    Ok((StatusCode::OK, Json(model)).into_response())
}

#[debug_handler]
async fn remove(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let _result = WeightRecord::delete_by_id(&ctx.db, user.organisation_pid, id).await?;

    Ok((StatusCode::NO_CONTENT, Json(json!({}))).into_response())
}

#[debug_handler]
async fn update(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateWeightRecord<'static>>,
) -> Result<Response> {
    let model = WeightRecord::update_by_id(&ctx.db, id, user.organisation_pid, &params).await?;

    Ok((StatusCode::CREATED, Json(model)).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/", post(add))
        .route("/{id}", get(one))
        .route("/{id}", delete(remove))
        .route("/{id}", patch(update))
        .with_state(ctx)
}
