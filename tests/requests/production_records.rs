use insta::{Settings, assert_debug_snapshot, with_settings};
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
