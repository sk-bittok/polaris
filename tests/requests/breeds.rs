use insta::{Settings, assert_debug_snapshot, with_settings};
use serial_test::serial;

use crate::request;

use crate::requests::prepare_auth;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/breeds");
        settings.set_snapshot_suffix("breeds");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_fetch_all() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db)
            .await
            .inspect_err(|e| eprintln!("Seed error {:?}", e))
            .unwrap();

        let user = prepare_auth::init_login(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server
            .get("/breeds")
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
            assert_debug_snapshot!((request.status_code(), request.text()));
        });
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_fetch_by_id() {
    request(|server, context| async move {
        configure_insta!();

        let user = prepare_auth::init_login(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server
            .get("/breeds/1")
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
            assert_debug_snapshot!((request.status_code(), request.text()));
        });
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_create_one() {
    request(|server, context| async move {
        configure_insta!();

        let post_data = serde_json::json!({
            "name": "Fleckvieh",
            "description": "A dual purpose (milk and meat) breed of cattle with a white head and either a brown, red or yellow with white sections body",
            "typicalGestationPeriod": "285 days",
            "specieId": 1,
            "typicalMaleWeightRange": "1000-1300 kg",
            "typicalFemalWeightRange": "600-800 kg"
        });

        let user = prepare_auth::init_login(&server, &context).await;

        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server.post("/breeds")
            .json(&post_data)
            .add_header(auth_header, auth_value).await;

        with_settings!({
            filters => {
                let mut filters = crate::cleanup_date().to_vec();
                filters.extend(crate::cleanup_uuid().to_vec());
                filters.extend(crate::cleanup_int().to_vec());
                filters
         }
        }, {
                assert_debug_snapshot!((request.status_code(), request.text()));
        })
    })
    .await;
}
