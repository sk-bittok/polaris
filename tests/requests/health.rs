use axum::http::StatusCode;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::health_records::HealthRecord;
use serial_test::serial;

use crate::requests::prepare_auth;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_snapshot_path("snapshots/records");
        settings.set_snapshot_suffix("health");
        settings.set_prepend_module_to_snapshot(false);
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_get_all() {
    crate::request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &context).await;

        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let response = server
            .get("/health-records")
            .add_header(auth_header, auth_value)
            .await;

        assert_eq!(response.status_code(), StatusCode::OK);

        assert_debug_snapshot!((response.status_code(), response.text()));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_by_id() {
    crate::request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &context).await;

        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let response = server
            .get("/health-records/101")
            .add_header(auth_header, auth_value)
            .await;

        assert_eq!(response.status_code(), StatusCode::OK);

        assert_debug_snapshot!((response.status_code(), response.text()));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_post_one() {
    crate::request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let body = serde_json::json!({
            "tagId": "AC002",
            "recordDate": "2025-05-12",
            "recordType": "vaccination",
            "description": "Vaccinated Buttercup against foot and mouth disease.",
            "treatment": "oral solution",
            "dosage": "250",
            "medicine": "Anti FnM",
            "cost": 2500,
            "performedBy": "James Dokter",
            "notes": null,
        });

        let response = server
            .post("/health-records")
            .add_header(auth_header, auth_value)
            .json(&body)
            .await;

        assert_eq!(response.status_code(), StatusCode::CREATED);

        with_settings!({
            filters => {
                let mut filters = crate::cleanup_date().to_vec();
                filters.extend(crate::cleanup_uuid().to_vec());
                filters.extend(crate::cleanup_int().to_vec());
                filters
            }
        }, {
        assert_debug_snapshot!((response.status_code(), response.json::<HealthRecord>()));
        })
    })
    .await;
}
