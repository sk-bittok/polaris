use tracing_subscriber::{
    filter::{FromEnvError, ParseError},
    util::TryInitError,
};

pub type ConfigResult<T> = Result<T, ConfigError>;

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error(transparent)]
    Config(#[from] config::ConfigError),
    #[error(transparent)]
    Env(#[from] std::env::VarError),
    #[error("{0}")]
    FileNotFound(String),
    #[error(transparent)]
    FromEnv(#[from] FromEnvError),
    #[error(transparent)]
    IO(#[from] std::io::Error),
    #[error(transparent)]
    Jwt(#[from] jsonwebtoken::errors::Error),
    #[error(transparent)]
    Migrate(#[from] sqlx::migrate::MigrateError),
    #[error(transparent)]
    Parse(#[from] ParseError),
    #[error(transparent)]
    SerdeYml(#[from] serde_yml::Error),
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Tera(#[from] tera::Error),
    #[error(transparent)]
    TryInit(#[from] TryInitError),
}
