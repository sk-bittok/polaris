#![allow(unused)]
use std::borrow::Cow;
use std::str::FromStr;

use chrono::NaiveDate;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::{dto::records::NewHealthRecord, health_records::HealthRecord};
use serial_test::serial;
use uuid::Uuid;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("health");
        settings.set_snapshot_path("snapshots/records");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_find_all() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = HealthRecord::find_all(&ctx.db, org_pid).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_find_by_user() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();
    let user_pid = Uuid::parse_str("bd6f7c26-d2c9-487e-b837-8f77be468033").unwrap();

    let result = HealthRecord::find_by_user(&ctx.db, org_pid, user_pid).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_find_by_treatment() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = HealthRecord::find_by_record_type(&ctx.db, "treatment", org_pid).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_find_by_animal() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();
    let animal_pid = Uuid::parse_str("62197c29-a2dd-4591-a4d0-92f6d7099760").unwrap();

    let result = HealthRecord::find_by_animal(&ctx.db, animal_pid, org_pid).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_find_by_date() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();
    let animal_pid = Uuid::parse_str("62197c29-a2dd-4591-a4d0-92f6d7099760").unwrap();
    let start_date = NaiveDate::from_str("2024-06-01")
        .inspect_err(|e| eprintln!("Start Date error {e:?}"))
        .unwrap();
    let end_date = NaiveDate::from_str("2024-11-30")
        .inspect_err(|e| eprintln!("End date error {e:?}"))
        .unwrap();

    let result =
        HealthRecord::find_by_record_date_range(&ctx.db, org_pid, start_date, end_date).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_find_by_id() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = HealthRecord::find_by_id(&ctx.db, 101, org_pid).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_create_one() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap();
    let animal_pid = Uuid::parse_str("8904bd83-b425-456f-99af-ab8cc8a5a077").unwrap();
    let user_pid = Uuid::parse_str("e761d8e3-fc3e-4a2e-a6c9-7c7a4f2130e8").unwrap();

    let params = NewHealthRecord {
        animal_pid,
        record_type: Cow::Borrowed("vaccination"),
        record_date: Cow::Borrowed("2025-04-12"),
        description: Cow::Borrowed("Innoculation of Rocky against Foot and mouth disease"),
        treatment: Cow::Borrowed("vaccine injection"),
        notes: None,
        performed_by: Some(Cow::Borrowed("John Artz")),
        medicine: Some(Cow::Borrowed("Anti-Foot and mouth")),
        dosage: Some(Cow::Borrowed("250")),
        cost: Some(25000),
    };

    let result = HealthRecord::create(&ctx.db, &params, org_pid, user_pid).await;

    with_settings!({
        filters => {
            let mut filters = crate::cleanup_date().to_vec();
            filters.extend(crate::cleanup_uuid().to_vec());
            filters.extend(crate::cleanup_int().to_vec());
            filters
        }
    }, {
            assert_debug_snapshot!(result);
        });
}

#[tokio::test]
#[serial]
async fn can_delete_by_id() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap();

    let result = HealthRecord::delete_by_id(&ctx.db, org_pid, 104).await;

    assert_debug_snapshot!(result);
}
