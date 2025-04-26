#![allow(unused)]

use std::borrow::Cow;

use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::{
    dto::{CreateNewUser, RegisterAdmin},
    users::{User, UserQuery},
};
use rstest::rstest;
use serial_test::serial;
use uuid::Uuid;

use crate::{boot_test, cleanup_date, cleanup_int, cleanup_password, cleanup_uuid, seed_data};

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("users");
        settings.set_snapshot_path("snapshots/users");
        let _guard = settings.bind_to_scope();
    };
}

/// Creates an admin test.
#[tokio::test]
#[serial]
async fn can_create_user() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid =
        Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").expect("Failed to parse str");
    let password = "Password";

    let params = RegisterAdmin {
        email: Cow::Borrowed("test@mail.net"),
        first_name: Cow::Borrowed("Tester"),
        last_name: Cow::Borrowed("Framework"),
        password: Cow::Borrowed(&password),
        confirm_password: Cow::Borrowed(&password),
    };

    let result = User::create_admin(&ctx.db, &params, org_pid).await;

    with_settings!({
        filters => {
            let mut filters = cleanup_date().to_vec();
            filters.extend(cleanup_uuid().to_vec());
            filters.extend(cleanup_int().to_vec());
            filters.extend(cleanup_password());
            filters
        }
    }, {
            assert_debug_snapshot!(result);
        });
}

#[tokio::test]
#[serial]
async fn can_find_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let id = 10;

    let result = User::read_by_id(&ctx.db, id).await;

    assert_debug_snapshot!(result)
}

#[tokio::test]
#[serial]
async fn can_find_by_pid() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let pid = Uuid::parse_str("bd6f7c26-d2c9-487e-b837-8f77be468033").unwrap();

    let result = User::find_by_pid(&ctx.db, pid).await;

    assert_debug_snapshot!(result)
}

#[tokio::test]
#[serial]
async fn can_find_by_email() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = User::find_by_email(&ctx.db, "john.doe@acme.com").await;

    assert_debug_snapshot!(result);
}

#[rstest]
#[case("can_find_all_no_query", UserQuery::new(None, None))]
#[case(
    "can_find_all_role_query",
    UserQuery::new(Some("admin".to_string()), None)
)]
#[case("can_find_all_active_query", UserQuery::new(None, Some(true)))]
#[tokio::test]
#[serial]
async fn can_find_all(#[case] test_name: &str, #[case] query: UserQuery) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = User::read_all(&ctx.db, &query).await;

    assert_debug_snapshot!(test_name, result);
}

#[rstest]
#[case(
    "can_create_staff_user",
    CreateNewUser { email: Cow::Borrowed("staffemployee@mail.org"), first_name: Cow::Borrowed("Staff") , last_name: Cow::Borrowed("Employee") , role:  Cow::Borrowed("staff")  }
)]
#[case(
    "can_create_manager_user",
    CreateNewUser { email: Cow::Borrowed("manageremployee@mail.org"), first_name: Cow::Borrowed("Manager") , last_name: Cow::Borrowed("Employee") , role:  Cow::Borrowed("manager")  }
)]
#[tokio::test]
#[serial]
async fn can_manage_users(#[case] test_name: &str, #[case] params: CreateNewUser<'static>) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = User::admin_create_user(&ctx.db, org_pid, &params).await;

    with_settings!({
        filters => {
            let mut filters = cleanup_date().to_vec();
            filters.extend(cleanup_password().to_vec());
            filters.extend(cleanup_uuid().to_vec());
            filters.extend(cleanup_int().to_vec());
            filters
        }
    }, {
            assert_debug_snapshot!(test_name, result);
        })
}

#[tokio::test]
#[serial]
async fn can_handle_invalid_role() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();
    let params = CreateNewUser {
        email: Cow::Borrowed("staffemployee@mail.org"),
        first_name: Cow::Borrowed("Staff"),
        last_name: Cow::Borrowed("Employee"),
        role: Cow::Borrowed("wizard"),
    };

    let result = User::admin_create_user(&ctx.db, org_pid, &params).await;

    assert_debug_snapshot!(result);
}
