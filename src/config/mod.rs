#![allow(clippy::missing_const_for_fn)]
#![allow(clippy::missing_errors_doc)]

pub mod auth;
pub mod db;
pub mod env;
pub mod error;
pub mod logger;
pub mod server;

use std::path::PathBuf;

use serde::Deserialize;

pub use self::{
    auth::{AuthConfig, RsaJwtConfig},
    db::DatabaseConfig,
    env::Environment,
    error::{ConfigError, ConfigResult},
    logger::TelemetryConfig,
    server::ServerConfig,
};

#[derive(Debug, Clone, Deserialize)]
pub struct AppConfig {
    pub(crate) server: ServerConfig,
    pub(crate) logger: TelemetryConfig,
    pub(crate) db: DatabaseConfig,
    pub(crate) auth: AuthConfig,
}

impl AppConfig {
    /// Builds the [`AppConfig`] from the provided file and
    /// environmental variables set using the syntax APP__<<ENV>>=value
    ///
    /// # Errors
    /// * IO Errors such as missing file
    /// * Deserialisation Errors
    pub fn from_file(file: &str) -> ConfigResult<Self> {
        let env = Environment::from(file);

        Self::from_env(&env)
    }

    /// Builds the [`AppConfig`] from the provided file and
    /// environmental variables set using the syntax APP__<<ENV>>=value
    ///
    /// # Errors
    /// * IO Errors such as missing file
    /// * Deserialisation Errors
    pub fn from_env(env: &Environment) -> ConfigResult<Self> {
        let base_dir = std::env::current_dir()?;
        let config_dir = base_dir.join("config");
        let config_file = config_dir.join(format!("{env}.yaml",));

        let settings = config::Config::builder()
            .add_source(config::File::from(config_file))
            .add_source(
                config::Environment::with_prefix("APP")
                    .prefix_separator("_")
                    .separator("__"),
            )
            .build()?;

        settings.try_deserialize::<Self>().map_err(Into::into)
    }

    pub fn config_file(env: &Environment) -> ConfigResult<PathBuf> {
        let base_dir = std::env::current_dir()?;
        let config_dir = base_dir.join("config");

        let file = config_dir.join(format!("{env}.yaml"));

        if !file.is_file() || !file.exists() {
            return Err(ConfigError::FileNotFound(file.display().to_string()));
        }

        Ok(file)
    }

    pub fn deserialise_yaml(env: &Environment) -> ConfigResult<Self> {
        let file = Self::config_file(env)?;

        let contents = std::fs::read_to_string(file)?;

        let rendered = render_string(&contents, &serde_json::json!({}))?;

        serde_yml::from_str(&rendered).map_err(Into::into)
    }

    #[must_use]
    pub fn server(&self) -> &ServerConfig {
        &self.server
    }

    #[must_use]
    pub fn logger(&self) -> &TelemetryConfig {
        &self.logger
    }

    #[must_use]
    pub fn database(&self) -> &DatabaseConfig {
        &self.db
    }

    #[must_use]
    pub fn auth(&self) -> &AuthConfig {
        &self.auth
    }
}

pub fn render_string(template: &str, locals: &serde_json::Value) -> ConfigResult<String> {
    tera::Tera::one_off(template, &tera::Context::from_serialize(locals)?, false)
        .map_err(Into::into)
}

#[cfg(test)]
mod test {
    use super::*;

    #[ignore = "Won't work in github actions because production.yaml is not pushed to the repo."]
    #[test]
    fn can_read_from_file() {
        let files = [
            "development",
            "testing",
            "production",
            "base",
            "dev",
            "prod",
            "test",
        ];

        for file in files {
            let config = AppConfig::from_file(file);
            assert!(config.is_ok());
        }
    }
}
