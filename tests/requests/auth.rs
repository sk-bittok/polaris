use insta::{Settings, assert_debug_snapshot, with_settings};
use serial_test::serial;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/auth");
        settings.set_snapshot_suffix("auth");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_register_admin_and_org() {
    crate::request(|server, ctx| async move {
        configure_insta!();

        crate::seed_data(&ctx.db).await.unwrap();

        let org_params = serde_json::json!({
            "name": "Sentinel Ranching",
            "address": null,
            "phone": null,
            "subscriptionType": "business",
            "email": null,
        });

        let admin_params = serde_json::json!({
           "email": "admin@mail.org",
           "firstName": "John",
           "lastName": "Doe",
           "password": "Password",
           "confirmPassword": "Password"
        });

        let params = serde_json::json!({
           "user": admin_params,
           "organisation": org_params
        });

        let response = server.post("/auth/register").json(&params).await;

        with_settings!({
            filters => {
               let mut filters = crate::cleanup_date().to_vec();
               filters.extend(crate::cleanup_uuid().to_vec());
               filters
            }
        }, {
                assert_debug_snapshot!((response.status_code(), response.text()));
            });
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_login() {
    crate::request(|server, context| async move {
        configure_insta!();

        crate::seed_data(&context.db).await.unwrap();

        let org_params = serde_json::json!({
            "name": "Sentinel Ranching",
            "address": null,
            "phone": null,
            "subscriptionType": "business",
            "email": null,
        });

        let admin_params = serde_json::json!({
           "email": "admin@mail.org",
           "firstName": "John",
           "lastName": "Doe",
           "password": "Password",
           "confirmPassword": "Password"
        });

        let params = serde_json::json!({
           "user": admin_params,
           "organisation": org_params
        });

        let response = server.post("/auth/register").json(&params).await;

        assert!(response.status_code().is_success());

        let body = serde_json::json!({
            "email": "admin@mail.org",
            "password": "Password"
        });

        let response = server.post("/auth/login").json(&body).await;

        with_settings!({
            filters => {
               let mut filters = crate::cleanup_date().to_vec();
               filters.extend(crate::cleanup_uuid().to_vec());
               filters
            }
        }, {
                assert_debug_snapshot!((response.status_code(), response.text()));
        });
    })
    .await;
}
