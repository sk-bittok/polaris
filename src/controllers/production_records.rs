use axum::{
    Json, Router, debug_handler,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
};

use crate::{
    AppContext, Result,
    models::{
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

pub fn router(ctx: &AppContext) -> Router {
    Router::new()
        .route("/", get(all))
        .route("/{id}", get(one))
        .with_state(ctx.clone())
}
