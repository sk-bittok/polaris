use axum::http::StatusCode;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::weight::WeightRecord;
use serial_test::serial;

use crate::requests::prepare_auth;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_snapshot_path("snapshots/records");
        settings.set_snapshot_suffix("weight");
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

        let request = server
            .get("/weight-records")
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((request.status_code(), request.text()));
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

        let request = server
            .get("/weight-records/107")
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((request.status_code(), request.text()));
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

        let payload = serde_json::json!({
            "tagId": "AC001",
            "recordDate": "2024-11-05",
            "mass": 48500,
            "notes": "Regular checkup",
            "unit": "kg",
            "status": "normal"
        });

        let request = server
            .post("/weight-records")
            .add_header(auth_header, auth_value)
            .json(&payload)
            .await;

        assert_eq!(request.status_code(), StatusCode::CREATED);

        with_settings!({
            filters => {
                let mut filters = crate::cleanup_date().to_vec();
                filters.extend(crate::cleanup_uuid().to_vec());
                filters.extend(crate::cleanup_int().to_vec());
                filters
            }
        }, {
            assert_debug_snapshot!((request.status_code(), request.json::<WeightRecord>()));
        });
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_delete_one() {
    crate::request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server
            .delete("/weight-records/107")
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((request.status_code(), request.text()));
    })
    .await;
}
