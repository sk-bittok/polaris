use crate::{request, requests::prepare_auth};

use axum::http::StatusCode;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::{models::animals::Animal, views::animals::AnimalResponse};
use serial_test::serial;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_snapshot_path("snapshots/animals");
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("anim");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_get_all() {
    request(|server, ctx| async move {
        configure_insta!();

        crate::seed_data(&ctx.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &ctx).await;

        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let request = server
            .get("/animals")
            .add_header(auth_header, auth_value)
            .await;

        assert_eq!(request.status_code(), StatusCode::OK);

        let data = request.json::<Vec<AnimalResponse>>();

        assert_debug_snapshot!((request.status_code(), data));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_by_id() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let id = "f6417c11-d817-4626-9e8d-c68a44002d4b";
        let request = server
            .get(&format!("/animals/{id}"))
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((request.status_code(), request.text()));
    })
    .await
}

#[tokio::test]
#[serial]
async fn can_post_one() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let params = serde_json::json!({
           "tagId": "AC025",
           "name": "Geoffrey",
           "specie": "cattle",
           "breed": "Friesian",
           "gender": "male",
           "status": "active",
           "currentWeight": 25000,
           "purchasePrice": 3500000,
           "purchaseDate": "2025-02-18",
           "dateOfBirth": "2023-10-16"
        });

        let request = server
            .post("/animals")
            .json(&params)
            .add_header(auth_header, auth_value)
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
            assert_debug_snapshot!((request.status_code(), request.json::<Animal>()));
        })
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_delete_one() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();
        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let id = "f6417c11-d817-4626-9e8d-c68a44002d4b";

        let request = server
            .delete(&format!("/animals/{}", id))
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((request.status_code(), request.text()));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_by_tag_id() {
    request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let user = prepare_auth::login_user(&server, &context).await;
        let (auth_header, auth_value) = prepare_auth::auth_header(user.access_token);

        let id = "AC003";

        let request = server
            .get(&format!("/animals/tag-id/{}", id))
            .add_header(auth_header, auth_value)
            .await;

        assert_debug_snapshot!((request.status_code(), request.text()));
    })
    .await;
}
