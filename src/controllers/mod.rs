pub mod admin;
pub mod animals;
pub mod auth;
pub mod breeds;
pub mod species;

use crate::{
    AppContext,
    middlewares::{
        self, AdminLayer, AuthLayer, authorisation::AuthorisationLayer, refresh::RefreshTokenLayer,
    },
};

use axum::{
    Json, Router,
    http::{StatusCode, Uri},
    response::{IntoResponse, Response},
    routing::get,
};
use serde::Serialize;
use tower_http::trace::TraceLayer;

#[derive(Debug, Serialize, Clone)]
struct GenericResponse {
    message: String,
}

impl GenericResponse {
    pub fn new<T: Into<String>>(msg: T) -> Self {
        Self {
            message: msg.into(),
        }
    }
}

async fn health() -> Response {
    let message = GenericResponse::new("Server is up and running");

    (StatusCode::OK, Json(message)).into_response()
}

async fn not_found(uri: Uri) -> Response {
    let message = GenericResponse::new(format!("No route for {uri}"));

    (StatusCode::NOT_FOUND, Json(message)).into_response()
}

pub fn router(ctx: &AppContext) -> Router {
    let trace_layer = TraceLayer::new_for_http()
        .make_span_with(middlewares::make_span_with)
        .on_request(middlewares::on_request)
        .on_response(middlewares::on_response)
        .on_failure(middlewares::on_failure);

    let protected_routes = Router::new()
        .nest("/admin", admin::route(ctx).layer(AdminLayer::new(ctx)))
        .nest("/breeds", breeds::router(ctx))
        .nest("/categories", species::router(ctx))
        .nest("/animals", animals::router(ctx))
        .layer(AuthorisationLayer::new(ctx))
        .layer(AuthLayer::new(ctx))
        .layer(RefreshTokenLayer::new(ctx));

    let general_routes = Router::new()
        .route("/health", get(health))
        .nest("/auth", auth::router(ctx));

    Router::new()
        .merge(general_routes)
        .merge(protected_routes)
        .fallback(not_found)
        .layer(trace_layer)
}
