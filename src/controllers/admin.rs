use axum::{
    Extension, Json, Router, body::Body, debug_handler, extract::State, http::StatusCode,
    response::Response, routing::post,
};
use serde_json::json;

use crate::{
    AppContext, Error, Result,
    middlewares::TokenClaims,
    models::{ModelError, dto::CreateNewUser, users::User},
};

/// Allows an admin to create a new user within their organisation.
///
/// This handler validates the admin from the JWT claims, then creates a new
/// user tied to the same organisation, and commits the changes in a transaction.
///
/// # Arguments
/// * `ctx` - Application context with DB access.
/// * `auth` - JWT token claims of the requesting admin.
/// * `params` - New user creation details.
///
/// # Returns
/// A `201 Created` response with a confirmation message.
///
/// # Errors
/// Returns an error if:
/// * The admin is invalid or not found.
/// * User creation or transaction commit fails.

#[debug_handler]
async fn add_user(
    State(ctx): State<AppContext>,
    Extension(auth): Extension<TokenClaims>,
    Json(params): Json<CreateNewUser<'static>>,
) -> Result<Response> {
    let mut txn = ctx.db.begin().await.map_err(ModelError::Sqlx)?;

    let admin = User::find_by_claims_key(&mut *txn, &auth.sub)
        .await?
        .ok_or_else(|| Error::InvalidToken)?;

    let user = User::admin_create_user(&mut *txn, admin.organisation_pid, &params).await?;

    txn.commit().await?;

    // email the new user how to login and change his password immediately.
    Ok(
        Response::builder()
        .status(StatusCode::CREATED)
        .body(Body::new(json!({ 
                "message": format!("Successfully created new user {} {} with role {}", &user.first_name, &user.last_name, &user.role) }).to_string()))
        ?)
}

pub fn route(ctx: &AppContext) -> Router {
    Router::new()
        .route("/add-user", post(add_user))
        .with_state(ctx.clone())
}
