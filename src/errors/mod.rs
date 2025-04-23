use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

use crate::models::ModelError;

pub type Result<T, E = Report> = std::result::Result<T, E>;

#[derive(Debug)]
pub struct Report(pub color_eyre::Report);

impl std::fmt::Display for Report {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl<E> From<E> for Report
where
    E: Into<color_eyre::Report>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

impl IntoResponse for Report {
    fn into_response(self) -> Response {
        let err = self.0;
        let err_string = format!("{err:?}");

        tracing::error!("{err_string}");

        if let Some(err) = err.downcast_ref::<Error>() {
            return err.response();
        }

        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Something went wrong on our end",
        )
            .into_response()
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Axum(#[from] axum::Error),
    #[error(transparent)]
    AxumHttp(#[from] axum::http::Error),
    #[error(transparent)]
    Config(#[from] crate::config::ConfigError),
    #[error("Forbidden")]
    Forbidden,
    #[error(transparent)]
    IO(#[from] std::io::Error),
    #[error("Invalid subscription type for organisation")]
    InvalidSubscriptionType,
    #[error("Invalid token")]
    InvalidToken,
    #[error(transparent)]
    JsonWebToken(#[from] jsonwebtoken::errors::Error),
    #[error("Missing Credentials")]
    MissingCredentials,
    #[error(transparent)]
    Model(#[from] ModelError),
    #[error("Invalid login details")]
    WrongCredentials,
    #[error("Unauthorised")]
    Unauthorised,
    #[error("{0}")]
    Other(String),
}

impl Error {
    #[must_use]
    pub fn response(&self) -> Response {
        let (status, message) = match self {
            Self::Axum(_)
            | Self::AxumHttp(_)
            | Self::Config(_)
            | Self::IO(_)
            | Self::JsonWebToken(_)
            | Self::Other(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Something went wrong on our end",
            ),
            Self::Model(error) => return error.response(),
            Self::WrongCredentials => (StatusCode::UNAUTHORIZED, "Wrong email or password"),
            Self::InvalidToken => (StatusCode::BAD_REQUEST, "Invalid auth token"),
            Self::MissingCredentials => (StatusCode::BAD_REQUEST, "Missing credentials"),
            Self::Forbidden => (StatusCode::FORBIDDEN, "You do not have permission"),
            Self::Unauthorised => (StatusCode::UNAUTHORIZED, "Login to continue."),
            Self::InvalidSubscriptionType => (StatusCode::BAD_REQUEST, "Invalid subscription type"),
        };

        let body = Json(json!({
            "message": message
        }));

        (status, body).into_response()
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        self.response()
    }
}
