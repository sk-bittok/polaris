use axum::{
    Extension, Json, Router,
    body::Body,
    debug_handler,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post},
};
use serde_json::json;

use crate::{
    AppContext, Error, Result,
    middlewares::TokenClaims,
    models::{
        breeds::{Breed, BreedQuery},
        dto::{RegisterBreed, UpdateBreed},
        species::Specie,
        users::User,
    },
    views::animals::BreedResponse,
};

#[debug_handler]
async fn all(
    State(ctx): State<AppContext>,
    Extension(_auth): Extension<TokenClaims>,
    user: User,
    Query(conditions): Query<BreedQuery>,
) -> Result<Response> {
    let breeds = Breed::find_by_all(&ctx.db, user.organisation_pid, &conditions).await?;

    let breeds_futures = breeds
        .iter()
        .map(|breed| {
            let db = ctx.db.clone();
            let breed = breed.clone();
            async move {
                let specie = Specie::find_by_id(&db, breed.specie_id).await?;
                Ok::<_, Error>(BreedResponse::new(&breed, &specie.name))
            }
        })
        .collect::<Vec<_>>();

    let breeds_response = futures::future::try_join_all(breeds_futures).await?;

    Ok((StatusCode::OK, Json(breeds_response)).into_response())
}

#[debug_handler]
async fn one(State(ctx): State<AppContext>, user: User, Path(id): Path<i32>) -> Result<Response> {
    let breed = Breed::find_by_id(&ctx.db, id, user.organisation_pid).await?;
    let specie = Specie::find_by_id(&ctx.db, breed.specie_id).await?;

    Ok((
        StatusCode::OK,
        Json(BreedResponse::new(&breed, &specie.name)),
    )
        .into_response())
}

#[debug_handler]
async fn add(
    State(ctx): State<AppContext>,
    user: User,
    Json(params): Json<RegisterBreed<'static>>,
) -> Result<Response> {
    let mut tx = ctx.db.begin().await?;

    let specie = Specie::find_by_name(&mut *tx, &params.specie).await?;
    let breed = Breed::create(&mut *tx, user.organisation_pid, &params, specie.id).await?;

    tx.commit().await?;

    let response = Response::builder()
        .status(StatusCode::CREATED)
        .body(Body::new(
            json!(BreedResponse::new(&breed, &specie.name)).to_string(),
        ))?;

    Ok(response)
}

#[debug_handler]
async fn remove(
    State(ctx): State<AppContext>,
    user: User,
    Path(id): Path<i32>,
) -> Result<Response> {
    let mut tx = ctx.db.begin().await?;

    let _result = Breed::delete_breed(&mut *tx, user.organisation_pid, id).await?;

    tx.commit().await?;

    Ok((StatusCode::NO_CONTENT, Json(json!({}))).into_response())
}

#[debug_handler]
async fn update(
    State(ctx): State<AppContext>,
    user: User,
    Path(id): Path<i32>,
    Json(params): Json<UpdateBreed<'static>>,
) -> Result<Response> {
    let breed = Breed::update_by_id(&ctx.db, user.organisation_pid, id, &params).await?;

    Ok((StatusCode::CREATED, Json(breed)).into_response())
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
