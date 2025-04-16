use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

use crate::seed::SeedError;

pub type ModelResult<T> = Result<T, ModelError>;

#[derive(Debug, thiserror::Error)]
pub enum ModelError {
    #[error("{0}")]
    ArgonHash(argon2::password_hash::Error),
    #[error("{0}")]
    EntityAlreadyExists(String),
    #[error("Entity not found")]
    EntityNotFound,
    #[error(transparent)]
    Seed(#[from] SeedError),
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Uuid(#[from] uuid::Error),
}

impl From<argon2::password_hash::Error> for ModelError {
    fn from(error: argon2::password_hash::Error) -> Self {
        Self::ArgonHash(error)
    }
}

impl ModelError {
    #[must_use]
    pub fn response(&self) -> Response {
        let (status, message) = match self {
            Self::ArgonHash(_) | Self::Sqlx(_) | Self::Seed(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Something went wrong on our end",
            ),
            Self::EntityNotFound => (StatusCode::NOT_FOUND, "Entity not found"),
            Self::EntityAlreadyExists(error) => (StatusCode::CONFLICT, error.as_str()),
            Self::Uuid(_e) => (StatusCode::UNPROCESSABLE_ENTITY, "Bad request"),
        };

        let body = Json(json!({"message": message }));

        (status, body).into_response()
    }
}
