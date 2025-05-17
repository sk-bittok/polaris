#![allow(clippy::wildcard_imports)]

use axum::{
    Extension, Json, Router,
    body::Body,
    debug_handler,
    extract::State,
    http::{StatusCode, header::SET_COOKIE},
    response::{IntoResponse, Redirect, Response},
    routing::{get, post},
};
use axum_extra::extract::cookie::{Cookie, SameSite};
use serde_json::json;

use crate::{
    AppContext, Error, Result,
    middlewares::{AuthLayer, TokenClaims},
    models::{ModelError, dto::*, orgs::*, users::*},
    views::user::*,
};

/// Registers a new super user and their organisation.
///
/// This handler creates an organisation and an admin user associated with it,
/// committing both operations in a single transaction.
///
/// # Arguments
/// * `ctx` - Shared application context holding the DB pool and services.
/// * `params` - The admin and organisation registration parameters.
///
/// # Returns
/// A `201 Created` response with a success message.
///
/// # Errors
/// Returns an error if:
/// * Database transaction fails.
/// * Organisation or user creation fails.
#[debug_handler]
#[tracing::instrument(skip(ctx, params))]
async fn register(
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterAdminParams<'static>>,
) -> Result<Response> {
    let mut txn = ctx.db.begin().await.map_err(ModelError::Sqlx)?;

    let organisation = Organisation::create(&mut *txn, &params.organisation).await?;

    let _user = User::create_admin(&mut *txn, &params.user, organisation.pid).await?;

    txn.commit().await.map_err(ModelError::Sqlx)?;

    Response::builder()
        .status(StatusCode::CREATED)
        .body(Body::new(
            json!({"message": "Account created successfully"}).to_string(),
        ))
        .map_err(Into::into)
}

/// Authenticates a user and returns JWT access and refresh tokens.
///
/// and issues both access and refresh tokens in the response.
/// This handler validates user credentials, checks if a password change is required,
///
/// # Arguments
/// * `ctx` - Shared application context.
/// * `params` - Email and password login credentials.
///
/// # Returns
/// A `200 OK` response containing the tokens or a redirect to update the password.
///
/// # Errors
/// Returns:
/// * `WrongCredentials` if email or password is invalid.
/// * `ModelError` or other internal errors for DB or token generation issues.

#[debug_handler]
async fn login(
    State(ctx): State<AppContext>,
    Json(params): Json<LoginUser<'static>>,
) -> Result<Response> {
    let validator = Validator::new(&params);
    let params = validator.validate()?;

    let user = User::find_by_email(&ctx.db, &params.email)
        .await?
        .ok_or_else(|| Error::WrongCredentials)?;

    if user.password_change_required {
        return Ok(Redirect::temporary("/auth/update-password").into_response());
    }

    let is_password_valid = user.validate_password(params.password.trim())?;

    if !is_password_valid {
        return Err(Error::WrongCredentials.into());
    }

    let access_token = ctx.auth.access.jwt(&user)?;
    let refresh_token = ctx.auth.refresh.jwt(&user)?;

    let body = LoginResponse::new(&user);

    let access_cookie = Cookie::build(("accessToken", &access_token))
        .path("/")
        .max_age(time::Duration::seconds(ctx.auth.access.exp))
        .http_only(true)
        .partitioned(true)
        .secure(false)
        .build();

    let refresh_cookie = Cookie::build(("refreshToken", &refresh_token))
        .path("/")
        .max_age(time::Duration::seconds(ctx.auth.refresh.exp))
        .http_only(true)
        .partitioned(true)
        .secure(false)
        .build();

    let mut response = Response::builder()
        .status(StatusCode::OK)
        .header("Authorization", format!("Bearer {}", &access_token))
        .body(Body::new(json!(body).to_string()))?;

    response
        .headers_mut()
        .append(SET_COOKIE, access_cookie.to_string().parse()?);
    response
        .headers_mut()
        .append(SET_COOKIE, refresh_cookie.to_string().parse()?);

    Ok(response)
}

/// Logs out the authenticated user and invalidates their session.
///
/// This handler finds the user based on token claims, logs the logout event,
/// and clears the access and refresh cookies.
///
/// # Arguments
/// * `ctx` - Application context with DB and services.
/// * `auth` - Decoded JWT token claims.
///
/// # Returns
/// A `200 OK` response with a logout success message.
///
/// # Errors
/// Returns an error if:
/// * User lookup or update fails.
/// * Transaction commit fails.

#[debug_handler]
async fn logout(
    State(ctx): State<AppContext>,
    Extension(auth): Extension<TokenClaims>,
) -> Result<Response> {
    let mut txn = ctx.db.begin().await.map_err(ModelError::Sqlx)?;

    let mut user = User::find_by_claims_key(&mut *txn, &auth.sub)
        .await?
        .ok_or_else(|| ModelError::EntityNotFound)?;

    user = user.record_logout(&mut *txn).await?;

    tracing::info!("User {} logged out at {:?}", &user.email, user.last_login);

    txn.commit().await?;

    let access_cookie = Cookie::build(("accessToken", ""))
        .path("/")
        .max_age(time::Duration::hours(-1))
        .same_site(SameSite::Lax)
        .partitioned(true)
        .http_only(true);

    let refresh_cookie = Cookie::build(("refreshToken", ""))
        .path("/")
        .max_age(time::Duration::hours(-1))
        .same_site(SameSite::Lax)
        .partitioned(true)
        .http_only(true);

    let mut response = Response::builder()
        .status(StatusCode::OK)
        .body(Body::new(json!({"message": "Logout success"}).to_string()))?;

    response
        .headers_mut()
        .append(SET_COOKIE, access_cookie.to_string().parse()?);
    response
        .headers_mut()
        .append(SET_COOKIE, refresh_cookie.to_string().parse()?);

    Ok(response)
}

/// Retrieves information about the currently authenticated user.
///
/// This handler extracts the user from token claims and returns public user info.
///
/// # Arguments
/// * `ctx` - App context for DB access.
/// * `auth` - JWT token claims used to identify the user.
///
/// # Returns
/// A `200 OK` response containing the current user's data.
///
/// # Errors
/// Returns `InvalidToken` if the user cannot be found.

#[debug_handler]
async fn current(
    State(ctx): State<AppContext>,
    Extension(auth): Extension<TokenClaims>,
) -> Result<Response> {
    let user = User::find_by_claims_key(&ctx.db, &auth.sub)
        .await?
        .ok_or_else(|| Error::InvalidToken)?;

    Ok((StatusCode::OK, Json(CurrentUser::new(&user))).into_response())
}

/// Updates the password for a user who was created by a super-user.
///
/// This is typically used for first-time login scenarios where the password
/// needs to be changed immediately.
///
/// # Arguments
/// * `ctx` - Application context with DB access.
/// * `params` - Password update payload containing email and new password.
///
/// # Returns
/// A redirect to the login page upon success.
///
/// # Errors
/// Returns an error if:
/// * The user cannot be found.
/// * The password update or DB commit fails.
#[debug_handler]
async fn update_password(
    State(ctx): State<AppContext>,
    Json(params): Json<UpdatePassword<'static>>,
) -> Result<Response> {
    let mut txn = ctx.db.begin().await?;

    let mut user = User::find_by_email(&mut *txn, &params.email)
        .await?
        .ok_or_else(|| Error::Forbidden)?;

    user = user.update_password(&mut *txn, &params).await?;

    tracing::info!(
        "Updated user {} {}, password change required {}",
        &user.first_name,
        &user.last_name,
        &user.password_change_required
    );

    txn.commit().await?;

    Ok(Redirect::to("/auth/login").into_response())
}

pub fn router(ctx: AppContext) -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/logout", post(logout).layer(AuthLayer::new(&ctx)))
        .route("/current", get(current).layer(AuthLayer::new(&ctx)))
        .route("/update-password", post(update_password))
        .with_state(ctx)
}
