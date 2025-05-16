use axum::http::StatusCode;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::production_records::ProductionRecord;
use serial_test::serial;

use super::prepare_auth;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/records");
        settings.set_snapshot_suffix("precords");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_get_by_id() {
    crate::request(|server, ctx| async move {
        configure_insta!();

        crate::seed_data(&ctx.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &ctx).await;

        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let response = server
            .get("/production-records/101")
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((response.status_code(), response.text()));
    })
    .await;
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
            .get("/production-records")
            .add_header(auth_header, auth_value)
            .await;

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

        let params = serde_json::json!({
            "tagId": "AC001",
            "productionType": "milk",
            "quantity": 2400,
            "unit": "litres",
            "quality": "High butter",
            "date": "2025-05-14"
        });

        let response = server
            .post("/production-records")
            .add_header(auth_header, auth_value)
            .json(&params)
            .await;

        assert_eq!(StatusCode::CREATED, response.status_code());

        with_settings!(
            {
                filters => {
                    let mut filters = crate::cleanup_date().to_vec();
                    filters.extend(crate::cleanup_uuid().to_vec());
                    filters.extend(crate::cleanup_int().to_vec());
                    filters
                }
            },
            {
                assert_debug_snapshot!((response.status_code(), response.json::<ProductionRecord>()));
            }
        )
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

        let response = server
            .delete("/production-records/102")
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((response.status_code(), response.text()));
    })
    .await;
}
