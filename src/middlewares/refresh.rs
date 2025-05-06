use std::{
    convert::Infallible,
    task::{Context, Poll},
};

use axum::{
    body::Body,
    extract::FromRequestParts,
    http::{
        Request, Response,
        header::{AUTHORIZATION, SET_COOKIE},
    },
    response::IntoResponse,
};
use axum_extra::{
    TypedHeader,
    extract::cookie,
    headers::{Cookie, HeaderMapExt},
};
use futures::future::BoxFuture;
use jsonwebtoken::Validation;
use tower::{Layer, Service};

use crate::{AppContext, models::users::User};

use super::TokenClaims;

#[derive(Clone)]
pub struct RefreshTokenLayer {
    state: AppContext,
}

impl RefreshTokenLayer {
    #[must_use]
    pub fn new(ctx: &AppContext) -> Self {
        Self { state: ctx.clone() }
    }
}

impl<S> Layer<S> for RefreshTokenLayer {
    type Service = RefreshTokenService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service {
            inner,
            state: self.state.clone(),
        }
    }
}

#[derive(Clone)]
pub struct RefreshTokenService<S> {
    inner: S,
    state: AppContext,
}

impl<S, B> Service<Request<B>> for RefreshTokenService<S>
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

            match TokenClaims::from_request_parts(&mut parts, &state).await {
                Ok(claims) => {
                    let mut req = Request::from_parts(parts, body);
                    req.extensions_mut().insert(claims);
                    inner.call(req).await
                }
                Err(e) => {
                    tracing::error!("Access token error {:?}", &e);

                    // Get the refresh token from the cookies

                    let Some(cookies) = parts.headers.typed_get::<Cookie>() else {
                        return Ok(crate::Error::Unauthorised.response());
                    };
                    let refresh_token = match cookies.get("refreshToken") {
                        Some(cookie) => cookie.to_string(),
                        None => return Ok(crate::Error::Unauthorised.response()),
                    };

                    // Validate the refresh token
                    let token_claims = match jsonwebtoken::decode::<TokenClaims>(
                        &refresh_token,
                        &state.auth.refresh.decoding,
                        &Validation::new(jsonwebtoken::Algorithm::RS256),
                    ) {
                        Ok(token_data) => token_data.claims,
                        Err(_e) => return Ok(crate::Error::InvalidToken.response()),
                    };

                    // Fetch the user and issue a new access-token
                    let user = match User::find_by_claims_key(&state.db, &token_claims.sub).await {
                        Ok(Some(user)) => user,
                        Ok(None) => return Ok(crate::Error::InvalidToken.response()),
                        Err(e) => return Ok(e.response()),
                    };

                    let new_access_token = match state.auth.access.jwt(&user) {
                        Ok(token) => token,
                        Err(e) => return Ok(e.into_response()),
                    };

                    // Set the new access-token in the cookie and authorization header

                    let mut req = Request::from_parts(parts, body);
                    req.headers_mut().append(
                        AUTHORIZATION,
                        format!("Bearer {}", &new_access_token).parse().unwrap(),
                    );
                    req.extensions_mut().insert(token_claims);

                    let mut response = inner.call(req).await?;

                    response.headers_mut().append(
                        AUTHORIZATION,
                        format!("Bearer {}", &new_access_token).parse().unwrap(),
                    );

                    let access_cookie = cookie::Cookie::build(("accessToken", &new_access_token))
                        .path("/")
                        .max_age(time::Duration::seconds(state.auth.access.exp))
                        .http_only(true)
                        .partitioned(true)
                        .secure(false)
                        .build();

                    response
                        .headers_mut()
                        .append(SET_COOKIE, access_cookie.to_string().parse().unwrap());

                    Ok(response)
                }
            }
        })
    }
}
