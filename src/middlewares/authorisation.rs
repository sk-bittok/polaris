use std::{
    convert::Infallible,
    task::{Context, Poll},
};

use crate::{AppContext, models::roles::Role};

use axum::{
    body::Body,
    extract::FromRequestParts,
    http::{Request, Response, StatusCode},
};
use futures_util::future::BoxFuture;
use tower::{Layer, Service};

use super::TokenClaims;

#[derive(Clone)]
pub struct AuthorisationLayer {
    state: AppContext,
}

impl AuthorisationLayer {
    #[must_use]
    pub fn new(ctx: &AppContext) -> Self {
        Self { state: ctx.clone() }
    }
}

impl<S> Layer<S> for AuthorisationLayer {
    type Service = AuthorisationService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service {
            inner,
            state: self.state.clone(),
        }
    }
}

#[derive(Clone)]
pub struct AuthorisationService<S> {
    inner: S,
    state: AppContext,
}

impl<S, B> Service<Request<B>> for AuthorisationService<S>
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

            let method = parts.method.clone();
            let uri = parts.uri.clone();

            let claims = match TokenClaims::from_request_parts(&mut parts, &state).await {
                Ok(claims) => claims,
                Err(e) => return Ok(e.response()),
            };

            let role: Role = match Role::find_by_name(&state.db, &claims.role).await {
                Ok(role) => role,
                Err(e) => return Ok(e.response()),
            };

            if uri.path().contains("users") && !role.can_manage_users() {
                return Ok(Response::builder()
                    .status(StatusCode::FORBIDDEN)
                    .body(Body::new(
                        serde_json::json!({
                            "messsage": "Forbidden. Access denied"
                        })
                        .to_string(),
                    ))
                    .unwrap());
            }

            if method == "DELETE" && !role.can_delete() {
                return Ok(Response::builder()
                    .status(StatusCode::FORBIDDEN)
                    .body(Body::new(
                        serde_json::json!({
                            "message": "Forbidden. Access denied"
                        })
                        .to_string(),
                    ))
                    .unwrap());
            }

            if (method == "POST" || method == "PATCH" || method == "PUT") && !role.can_write() {
                return Ok(Response::builder()
                    .status(StatusCode::FORBIDDEN)
                    .body(Body::new(
                        serde_json::json!({
                            "message": "Forbidden. Access denied"
                        })
                        .to_string(),
                    ))
                    .unwrap());
            }

            let mut req = Request::from_parts(parts, body);
            req.extensions_mut().insert(claims);
            req.extensions_mut().insert(role);
            inner.call(req).await
        })
    }
}
