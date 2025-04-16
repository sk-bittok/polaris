#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_const_for_fn)]

use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header};
use sqlx::PgPool;

use crate::{
    AppConfig, Result, config::auth::RsaJwtConfig, middlewares::TokenClaims, models::users::User,
};

#[derive(Clone)]
pub struct AppContext {
    pub config: AppConfig,
    pub db: PgPool,
    pub auth: AuthContext,
}

impl AppContext {
    pub async fn from_config(config: &AppConfig) -> Result<Self> {
        let pool = config.database().connection_pool()?;

        let access = RsaJwtContext::from_rsa(config.auth().access()).await?;
        let refresh = RsaJwtContext::from_rsa(config.auth().refresh()).await?;

        Ok(Self {
            config: config.clone(),
            db: pool,
            auth: AuthContext::new(access, refresh),
        })
    }

    pub async fn init(&self) -> Result<()> {
        self.config.database().init().await?;

        Ok(())
    }
}

#[derive(Clone)]
pub struct AuthContext {
    pub access: RsaJwtContext,
    pub refresh: RsaJwtContext,
}

impl AuthContext {
    #[must_use]
    pub fn new(access: RsaJwtContext, refresh: RsaJwtContext) -> Self {
        Self { access, refresh }
    }
}

#[derive(Clone)]
pub struct RsaJwtContext {
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
    pub exp: i64,
}

impl RsaJwtContext {
    pub fn new(encoding: EncodingKey, decoding: DecodingKey, exp: impl Into<i64>) -> Self {
        Self {
            encoding,
            decoding,
            exp: exp.into(),
        }
    }

    #[allow(clippy::cast_possible_wrap)]
    pub async fn from_rsa(jwt: &RsaJwtConfig) -> Result<Self> {
        let encoding = jwt.encoding().await?;
        let decoding = jwt.decoding().await?;
        let exp = jwt.max_age as i64;

        Ok(Self {
            encoding,
            decoding,
            exp,
        })
    }

    pub fn jwt(&self, user: &User) -> Result<String> {
        let header = Header::new(Algorithm::RS256);

        let now = Utc::now();

        let claims = TokenClaims {
            sub: user.pid.to_string(),
            role: user.role.to_string(),
            exp: (now + Duration::seconds(self.exp)).timestamp(),
            iat: now.timestamp(),
        };

        jsonwebtoken::encode(&header, &claims, &self.encoding).map_err(Into::into)
    }
}
