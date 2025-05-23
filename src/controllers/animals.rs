use std::borrow::Cow;

use axum::{
    Json, Router, debug_handler,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post},
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    AppContext, Result,
    models::{
        animals::{Animal, AnimalQuery},
        dto::{RegisterAnimal, UpdateAnimal},
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
async fn one(user: User, State(ctx): State<AppContext>, Path(id): Path<Uuid>) -> Result<Response> {
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
    Path(id): Path<Uuid>,
) -> Result<Response> {
    let _query = Animal::delete_by_id(&ctx.db, user.organisation_pid, id).await?;

    Ok((StatusCode::NO_CONTENT, Json(json!({}))).into_response())
}

#[debug_handler]
async fn update(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<Uuid>,
    Json(params): Json<UpdateAnimal<'static>>,
) -> Result<Response> {
    let model = Animal::update_by_id(&ctx.db, &params, user.organisation_pid, id).await?;

    Ok((StatusCode::CREATED, Json(model)).into_response())
}

#[debug_handler]
async fn get_by_tag_id(
    user: User,
    State(ctx): State<AppContext>,
    Path(id): Path<Cow<'static, str>>,
) -> Result<Response> {
    let model = Animal::find_by_tag_id(&ctx.db, user.organisation_pid, &id).await?;

    Ok((StatusCode::OK, Json(model)).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", get(list))
        .route("/", post(add))
        .route("/{id}", get(one))
        .route("/{id}", delete(remove))
        .route("/{id}", patch(update))
        .route("/tag-id/{id}", get(get_by_tag_id))
        .with_state(ctx)
}
