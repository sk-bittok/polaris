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
use tower::{Layer, Service};

use crate::{AppContext, middlewares::TokenClaims};

#[derive(Clone)]
pub struct StaffLayer {
    pub state: AppContext,
}

impl StaffLayer {
    #[must_use]
    pub fn new(ctx: &AppContext) -> Self {
        Self { state: ctx.clone() }
    }
}

impl<S> Layer<S> for StaffLayer {
    type Service = StaffService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service {
            inner,
            state: self.state.clone(),
        }
    }
}

#[derive(Clone)]
pub struct StaffService<S> {
    pub inner: S,
    pub state: AppContext,
}

impl<S, B> Service<Request<B>> for StaffService<S>
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

            let claims = match TokenClaims::from_request_parts(&mut parts, &state).await {
                Ok(claims) => {
                    if claims.role.trim().to_lowercase().as_str() != "staff" {
                        return Ok(Response::builder()
                            .status(StatusCode::FORBIDDEN)
                            .body(Body::new(
                                serde_json::json!({
                                    "messsage": "Forbidden. Permission denied"
                                })
                                .to_string(),
                            ))
                            .unwrap());
                    }
                    claims
                }
                Err(e) => return Ok(e.response()),
            };

            let mut req = Request::from_parts(parts, body);
            req.extensions_mut().insert(claims);
            inner.call(req).await
        })
    }
}
