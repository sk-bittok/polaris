#![allow(clippy::missing_errors_doc)]
use std::path::PathBuf;

use jsonwebtoken::{DecodingKey, EncodingKey};
use serde::Deserialize;

use super::ConfigResult;

#[derive(Debug, Clone, Deserialize)]
pub struct RsaJwtConfig {
    pub private_key: PathBuf,
    pub public_key: PathBuf,
    pub max_age: u64,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AuthConfig {
    pub access: RsaJwtConfig,
    pub refresh: RsaJwtConfig,
}

impl AuthConfig {
    #[must_use]
    pub const fn access(&self) -> &RsaJwtConfig {
        &self.access
    }

    #[must_use]
    pub const fn refresh(&self) -> &RsaJwtConfig {
        &self.refresh
    }
}

impl RsaJwtConfig {
    pub async fn encoding(&self) -> ConfigResult<EncodingKey> {
        let key = tokio::fs::read_to_string(&self.private_key).await?;

        EncodingKey::from_rsa_pem(key.as_bytes()).map_err(Into::into)
    }

    pub async fn decoding(&self) -> ConfigResult<DecodingKey> {
        let key = tokio::fs::read_to_string(&self.public_key).await?;

        DecodingKey::from_rsa_pem(key.as_bytes()).map_err(Into::into)
    }
}
