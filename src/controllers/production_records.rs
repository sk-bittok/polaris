use axum::{
    Json, Router, debug_handler,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{delete, get, post},
};
use serde_json::json;

use crate::{
    AppContext, Result,
    models::{
        dto::records::NewProductionRecord,
        production_records::{ProductionQuery, ProductionRecord},
        users::User,
    },
};

#[debug_handler]
async fn all(
    user: User,
    State(ctx): State<AppContext>,
    Query(conditions): Query<ProductionQuery>,
) -> Result<Response> {
    let items = ProductionRecord::find_all(&ctx.db, user.organisation_pid, &conditions).await?;

    Ok((StatusCode::OK, Json(items)).into_response())
}

#[debug_handler]
async fn one(user: User, State(ctx): State<AppContext>, Path(id): Path<i32>) -> Result<Response> {
    let item = ProductionRecord::find_by_id(&ctx.db, id, user.organisation_pid).await?;

    Ok((StatusCode::OK, Json(item)).into_response())
}

#[debug_handler]
async fn add(
    user: User,
    State(ctx): State<AppContext>,
    Json(params): Json<NewProductionRecord<'static>>,
) -> Result<Response> {
    let item = ProductionRecord::create(&ctx.db, &params, user.organisation_pid, user.pid).await?;

    Ok((StatusCode::CREATED, Json(item)).into_response())
}

#[debug_handler]
async fn remove(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let _query = ProductionRecord::delete_by_id(&ctx.db, id, user.organisation_pid).await?;

    Ok((StatusCode::NO_CONTENT, Json(json!({}))).into_response())
}

pub fn router(ctx: &AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/", post(add))
        .route("/{id}", get(one))
        .route("/{id}", delete(remove))
        .with_state(ctx.clone())
}
