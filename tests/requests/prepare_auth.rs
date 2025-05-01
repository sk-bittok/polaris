#![allow(unused)]
use axum::http::{HeaderName, HeaderValue};
use axum_test::{TestResponse, TestServer};
use polaris::{AppContext, models::users::User};

const USER_EMAIL: &str = "admin@test.com";
const USER_PASSWORD: &str = "Password";

#[derive(Debug, Clone)]
pub struct LoggedInUser {
    pub user: User,
    pub access_token: HeaderValue,
}

pub async fn register_user(request: &TestServer) -> TestResponse {
    let org_payload = serde_json::json!({
        "companyName": "Test Org",
        "companyAddress": null,
        "companyPhone": null,
        "companyEmail": null,
        "subscriptionType": "business",
    });
    let user_payload = serde_json::json!({
        "email": USER_EMAIL,
        "firstName": "Test",
        "lastName": "User",
        "password": USER_PASSWORD,
        "confirmPassword": USER_PASSWORD
    });
    let register_payload = serde_json::json!({
        "organisation": org_payload,
        "user": user_payload
    });

    request.post("/auth/register").json(&register_payload).await
}

pub async fn init_login(server: &TestServer, context: &AppContext) -> LoggedInUser {
    register_user(server).await;

    let user = User::find_by_email(&context.db, USER_EMAIL)
        .await
        .unwrap()
        .unwrap();

    let response = server
        .post("/auth/login")
        .json(&serde_json::json!({
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        }))
        .await;

    let access_token = response.header("authorization");

    LoggedInUser { user, access_token }
}

pub fn auth_header(access_token: HeaderValue) -> (HeaderName, HeaderValue) {
    (HeaderName::from_static("authorization"), access_token)
}
