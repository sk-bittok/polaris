#![allow(unused)]
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::animals::Animal;
use rstest::rstest;
use serial_test::serial;
use uuid::Uuid;

use crate::{boot_test, cleanup_date, cleanup_int, cleanup_uuid, seed_data};

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("animals");
        settings.set_snapshot_path("snapshots/animals");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_find_all() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = Animal::find_all(&ctx.db, org_pid).await;

    assert_debug_snapshot!(result);
}
