#![allow(clippy::use_self)]
use std::{
    convert::Infallible,
    task::{Context, Poll},
};

use crate::{AppContext, Error};

use axum::{
    RequestPartsExt,
    body::Body,
    extract::{FromRef, FromRequestParts},
    http::{Request, Response},
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};
use futures_util::future::BoxFuture;
use jsonwebtoken::{Algorithm, Validation, errors::ErrorKind};
use serde::{Deserialize, Serialize};
use tower::{Layer, Service};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub role: String,
    pub exp: i64,
    pub iat: i64,
}

#[derive(Clone)]
pub struct AuthLayer {
    state: AppContext,
}

impl AuthLayer {
    #[must_use]
    pub fn new(ctx: &AppContext) -> Self {
        Self { state: ctx.clone() }
    }
}

impl<S> Layer<S> for AuthLayer {
    type Service = AuthService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service {
            inner,
            state: self.state.clone(),
        }
    }
}

#[derive(Clone)]
pub struct AuthService<S> {
    inner: S,
    state: AppContext,
}

impl<S, B> Service<Request<B>> for AuthService<S>
where
    S: Service<Request<B>, Response = Response<Body>, Error = Infallible> + Clone + Send + 'static,
    S::Future: Send + 'static,
    B: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request<B>) -> Self::Future {
        let state = self.state.clone();
        let clone = self.inner.clone();

        let mut inner = std::mem::replace(&mut self.inner, clone);
        Box::pin(async move {
            let (mut parts, body) = req.into_parts();

            let auth = match TokenClaims::from_request_parts(&mut parts, &state).await {
                Ok(claims) => claims,
                Err(e) => return Ok(e.response()),
            };

            let mut req = Request::from_parts(parts, body);
            req.extensions_mut().insert(auth);
            inner.call(req).await
        })
    }
}

impl<S> FromRequestParts<S> for TokenClaims
where
    S: Send + Sync,
    AppContext: FromRef<S>,
{
    type Rejection = Error;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &S,
    ) -> std::result::Result<Self, Self::Rejection> {
        let context = AppContext::from_ref(state);

        let token = match parts.extract::<TypedHeader<Authorization<Bearer>>>().await {
            Ok(bearer) => bearer.token().to_string(),
            Err(e) => {
                tracing::warn!(
                    "Typed-header-rejection due to {:?} now looking in cookies.",
                    e.reason()
                );
                let cookies = parts
                    .extract::<TypedHeader<axum_extra::headers::Cookie>>()
                    .await
                    .map_err(|e| {
                        tracing::error!("{:?}", e.reason());
                        Error::InvalidToken
                    })?;

                let cookies = cookies.get("accessToken");

                cookies.ok_or_else(|| Error::InvalidToken)?.to_string()
            }
        };

        let token_data = jsonwebtoken::decode::<TokenClaims>(
            &token,
            &context.auth.access.decoding,
            &Validation::new(Algorithm::RS256),
        )
        .map_err(|e| {
            tracing::error!("{:?}", e);
            match e.kind() {
                ErrorKind::ExpiredSignature => Error::ExpiredToken,
                _ => Error::InvalidToken,
            }
        })?;

        Ok(token_data.claims)
    }
}
