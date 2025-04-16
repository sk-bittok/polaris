use std::{
    convert::Infallible,
    task::{Context, Poll},
};

use axum::{
    body::Body,
    extract::FromRequestParts,
    http::{Request, Response, StatusCode},
};
use futures_util::future::BoxFuture;
use serde_json::json;
use tower::{Layer, Service};

use crate::AppContext;

use super::TokenClaims;

#[derive(Clone)]
pub struct AdminLayer {
    state: AppContext,
}

impl AdminLayer {
    #[must_use]
    pub fn new(ctx: &AppContext) -> Self {
        Self { state: ctx.clone() }
    }
}

impl<S> Layer<S> for AdminLayer {
    type Service = AdminService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service {
            inner,
            state: self.state.clone(),
        }
    }
}

#[derive(Clone)]
pub struct AdminService<S> {
    inner: S,
    state: AppContext,
}

impl<S, B> Service<Request<B>> for AdminService<S>
where
    S: Service<Request<B>, Error = Infallible, Response = Response<Body>> + Clone + Send + 'static,
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

            let claims = match TokenClaims::from_request_parts(&mut parts, &state).await {
                Ok(claims) => {
                    tracing::info!("{} {}", &claims.sub, &claims.role);
                    if claims.role.trim().to_lowercase().as_str() != "admin" {
                        return Ok(Response::builder()
                            .status(StatusCode::FORBIDDEN)
                            .body(Body::new(
                                json!({"message": "You do not have enough permission to continue"})
                                    .to_string(),
                            ))
                            .unwrap());
                    }

                    claims
                }
                Err(err) => {
                    return Ok(err.response());
                }
            };

            let mut req = Request::from_parts(parts, body);
            req.extensions_mut().insert(claims);
            inner.call(req).await
        })
    }
}
