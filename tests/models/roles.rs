use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::roles::Role;
use rstest::rstest;
use serial_test::serial;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/roles");
        settings.set_snapshot_suffix("roles");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_find_all() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let result = Role::find_all(&ctx.db).await;

    with_settings!({
        filters => {
             crate::cleanup_date().to_vec()
        }
    }, {
        assert_debug_snapshot!(result);
    })
}

#[rstest]
#[case("can_find_by_id_1", 1)]
#[case("can_find_by_id_2", 2)]
#[case("can_find_by_id_3", 3)]
#[tokio::test]
#[serial]
async fn can_find_by_id(#[case] name: &str, #[case] id: i32) {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let result = Role::find_by_id(&ctx.db, id).await;

    with_settings!({
        filters => {
             crate::cleanup_date().to_vec()
        }
    }, {
        assert_debug_snapshot!(name, result);
    })
}

#[rstest]
#[case("permissions_admin", 1)]
#[case("permissions_manager", 2)]
#[case("permissions_staff", 3)]
#[tokio::test]
#[serial]
async fn can_check_permissions(#[case] name: &str, #[case] id: i32) {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let role = Role::find_by_id(&ctx.db, id).await.unwrap();

    let can_read = role.can_read();
    let can_write = role.can_write();
    let can_delete = role.can_delete();
    let can_manage_users = role.can_manage_users();

    assert_debug_snapshot!(name, (can_read, can_write, can_delete, can_manage_users));
}
