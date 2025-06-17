use axum::http::StatusCode;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::SpecieSummary;
use serial_test::serial;

use crate::request;

use crate::requests::prepare_auth;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/reports");
        settings.set_snapshot_suffix("categories");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_generate_one() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db)
            .await
            .inspect_err(|e| eprintln!("Seed error {:?}", e))
            .unwrap();

        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server
            .post("/reports/categories?specie=cattle")
            .add_header(auth_header, auth_value)
            .await;

        assert_eq!(StatusCode::CREATED, request.status_code());

        with_settings!({
            filters => {
                let mut filters = crate::cleanup_date().to_vec();
                filters.extend(crate::cleanup_uuid().to_vec());
                filters.extend(crate::cleanup_int().to_vec());
                filters
            }
        }, {
            assert_debug_snapshot!((request.status_code(), request.json::<SpecieSummary>()));
        });
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_all() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db)
            .await
            .inspect_err(|e| eprintln!("Seed error {:?}", e))
            .unwrap();

        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server
            .post("/reports/categories?specie=cattle")
            .add_header(&auth_header, &auth_value)
            .await;

        assert_eq!(StatusCode::CREATED, request.status_code());

        let response = server
            .get("/reports/categories?specie=cattle")
            .add_header(auth_header, auth_value)
            .await;

        with_settings!({
            filters => {
                let mut filters = crate::cleanup_date().to_vec();
                filters.extend(crate::cleanup_uuid().to_vec());
                filters.extend(crate::cleanup_int().to_vec());
                filters
            }
        }, {
            assert_debug_snapshot!((response.status_code(), response.json::<Vec<SpecieSummary>>()));
        });
    })
    .await;
}
