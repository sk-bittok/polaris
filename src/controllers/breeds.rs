use axum::{
    Extension, Json, Router,
    body::Body,
    debug_handler,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
};
use serde_json::json;

use crate::{
    AppContext, Error, Result,
    middlewares::TokenClaims,
    models::{
        breeds::{Breed, BreedQuery},
        dto::RegisterBreed,
        species::Specie,
        users::User,
    },
    views::animals::BreedResponse,
};

#[debug_handler]
async fn all(
    State(ctx): State<AppContext>,
    Extension(auth): Extension<TokenClaims>,
    Query(conditions): Query<BreedQuery>,
) -> Result<Response> {
    let user = User::find_by_claims_key(&ctx.db, &auth.sub)
        .await?
        .ok_or_else(|| Error::Unauthorised)?;

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
async fn one(
    State(ctx): State<AppContext>,
    Extension(auth): Extension<TokenClaims>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let user = User::find_by_claims_key(&ctx.db, &auth.sub)
        .await?
        .ok_or_else(|| Error::Unauthorised)?;

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
    Extension(auth): Extension<TokenClaims>,
    Json(params): Json<RegisterBreed<'static>>,
) -> Result<Response> {
    let mut tx = ctx.db.begin().await?;

    let user = User::find_by_claims_key(&mut *tx, &auth.sub)
        .await?
        .ok_or_else(|| Error::Forbidden)?;

    let breed = Breed::create(&mut *tx, user.organisation_pid, &params).await?;
    let specie = Specie::find_by_id(&mut *tx, breed.specie_id).await?;

    tx.commit().await?;

    let response = Response::builder()
        .status(StatusCode::CREATED)
        .body(Body::new(
            json!(BreedResponse::new(&breed, &specie.name)).to_string(),
        ))?;

    Ok(response)
}

pub fn router(ctx: &AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/", post(add))
        .route("/{id}", get(one))
        .with_state(ctx.clone())
}
