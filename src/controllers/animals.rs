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
        animals::{Animal, AnimalQuery},
        dto::RegisterAnimal,
        users::User,
    },
};

#[debug_handler]
async fn list(
    user: User,
    State(ctx): State<AppContext>,
    Query(conditions): Query<AnimalQuery>,
) -> Result<Response> {
    let models = Animal::find_all(&ctx.db, user.organisation_pid, &conditions).await?;

    Ok((StatusCode::OK, Json(models)).into_response())
}

#[debug_handler]
async fn one(user: User, State(ctx): State<AppContext>, Path(id): Path<i32>) -> Result<Response> {
    let model = Animal::find_by_id(&ctx.db, user.organisation_pid, id).await?;

    Ok((StatusCode::OK, Json(model)).into_response())
}

#[debug_handler]
async fn add(
    user: User,
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterAnimal<'static>>,
) -> Result<Response> {
    let model = Animal::register(&ctx.db, user.organisation_pid, user.pid, &params).await?;

    Ok((StatusCode::CREATED, Json(model)).into_response())
}

#[debug_handler]
async fn remove(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let _query = Animal::delete_by_id(&ctx.db, user.organisation_pid, id).await?;

    Ok((StatusCode::NO_CONTENT, Json(json!({}))).into_response())
}

pub fn router(ctx: &AppContext) -> Router {
    Router::new()
        .route("/", get(list))
        .route("/", post(add))
        .route("/{id}", get(one))
        .route("/{id}", delete(remove))
        .with_state(ctx.clone())
}
