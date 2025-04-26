use insta::{Settings, assert_debug_snapshot};
use rstest::rstest;
use serial_test::serial;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/admin");
        settings.set_snapshot_suffix("admin");
        let _guard = settings.bind_to_scope();
    };
}

#[rstest]
#[case("can_create_user_with_role_manager", "manager")]
#[case("can_create_user_with_role_staff", "staff")]
#[tokio::test]
#[serial]
async fn can_create_user_with_role(#[case] name: &str, #[case] role: &str) {
    crate::request(|server, context| async move {
        configure_insta!();

        let admin_login = super::prepare_auth::init_login(&server, &context).await;
        let (auth_header, auth_value) = super::prepare_auth::auth_header(admin_login.access_token);

        let new_user_params = serde_json::json!({
           "email": "manager1@mail.com",
           "firstName": "Boss",
           "lastName": "Baby",
           "role": role
        });

        let response = server
            .post("/admin/add-user")
            .add_header(auth_header, auth_value)
            .json(&new_user_params)
            .await;

        assert_debug_snapshot!(name, (response.status_code(), response.text()));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_handle_invalid_roles() {
    crate::request(|server, context| async move {
        configure_insta!();

        let admin_login = super::prepare_auth::init_login(&server, &context).await;
        let (auth_header, auth_value) = super::prepare_auth::auth_header(admin_login.access_token);

        let new_user_params = serde_json::json!({
           "email": "manager2@mail.com",
           "firstName": "Boss",
           "lastName": "Baby",
           "role": "wizard"
        });

        let response = server
            .post("/admin/add-user")
            .add_header(auth_header, auth_value)
            .json(&new_user_params)
            .await;

        assert_debug_snapshot!((response.status_code(), response.text()));
    })
    .await;
}
