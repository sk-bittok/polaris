use axum::{
    Extension, Json, Router, debug_handler,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
};

use crate::{AppContext, Result, middlewares::TokenClaims, models::species::Specie};

#[debug_handler]
async fn all(
    State(ctx): State<AppContext>,
    Extension(_auth): Extension<TokenClaims>,
) -> Result<Response> {
    let species = Specie::find_by_all(&ctx.db).await?;

    Ok((StatusCode::OK, Json(species)).into_response())
}

#[debug_handler]
async fn one(State(ctx): State<AppContext>, Path(id): Path<i32>) -> Result<Response> {
    let specie = Specie::find_by_id(&ctx.db, id).await?;

    Ok((StatusCode::OK, Json(specie)).into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/{id}", get(one))
        .with_state(ctx)
}
