use axum::http::StatusCode;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::breeds::Breed;
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
            "specie": "cattle",
            "typicalMaleWeightRange": "1000-1300",
            "typicalFemaleWeightRange": "600-800"
        });

        let user = prepare_auth::init_login(&server, &context).await;

        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server.post("/breeds")
            .json(&post_data)
            .add_header(auth_header, auth_value).await;

        assert_eq!(request.status_code(), StatusCode::CREATED);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_delete_by_id() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let post_data = serde_json::json!({
            "name": "Fleckvieh",
            "description": "A dual purpose (milk and meat) breed of cattle with a white head and either a brown, red or yellow with white sections body",
            "typicalGestationPeriod": "285 days",
            "specie": "cattle",
            "typicalMaleWeightRange": "1000-1300 kg",
            "typicalFemalWeightRange": "600-800 kg"
        });
        let user = prepare_auth::init_login(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);
        server
            .post("/breeds")
            .json(&post_data)
            .add_header(&auth_header, &auth_value)
            .await;

        let request = server
            .delete("/breeds/8")
            .add_header(auth_header, auth_value)
            .await;

        assert_eq!(request.status_code(), StatusCode::NO_CONTENT);
    }).await;
}

#[tokio::test]
#[serial]
async fn can_update_by_id() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let post_data = serde_json::json!({
            "name": "Fleckvieh",
            "description": "A dual purpose (milk and meat) breed of cattle with a white head and either a brown, red or yellow with white sections body",
            "typicalGestationPeriod": "285 days",
            "specie": "cattle",
            "typicalMaleWeightRange": "1000-1300 kg",
            "typicalFemalWeightRange": "600-800 kg"
        });
        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);
        let _post_request = server
            .post("/breeds")
            .json(&post_data)
            .add_header(&auth_header, &auth_value)
            .await;

        let patch_data = serde_json::json!({
           "description": "Recently, great gains have been made in the genetic milk productiveness of the Fleckvieh through breed management to the point that the 
           Fleckvieh rivals pure milk producing dairy breeds. Special value is placed on the Fleckvieh’s fitness characteristics including fertility, longevity, calving ease, udder health, milking speed, somatic cell count, and persistence. A large percentage of young Fleckvieh cattle are on alpine grazing which results in good overall health and longevity of life. Breeding target: 38 per cent milk, 16 per cent beef, 46 per cent fitness. Fleckvieh cattle exhibit good development and performance capacity along with good conformation. 6,000 kg milk in the 1st lactation and over 7,000 – 9,000 kg milk in later lactations with 4.2 per cent fat and 3.7 per cent protein.
        Beef performance:
            Daily gain: 1.44 kg
            Carcass weight: 57.2 per cent
            EUROP classification E and U: > 85.7 per cent",
            "typicalFemaleWeight": "650-850 kg", 
        });

        let response = server.patch("/breeds/10").json(&patch_data).add_header(&auth_header, &auth_value).await;

        assert_eq!(response.status_code(), StatusCode::CREATED);

        with_settings!({
            filters => {
                let mut filters = crate::cleanup_date().to_vec();
                filters.extend(crate::cleanup_int().to_vec());
                filters
            }
        }, {
            assert_debug_snapshot!((response.status_code(), response.json::<Breed>()));    
        });

    }).await;
}
