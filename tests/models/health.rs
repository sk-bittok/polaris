#![allow(unused)]
use std::borrow::Cow;
use std::str::FromStr;

use chrono::NaiveDate;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::{
    dto::records::{NewHealthRecord, UpdateHealthRecord},
    health::{HealthRecord, HealthRecordsQuery},
};
use rstest::rstest;
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

#[rstest]
#[case(
    "can_find_all",
    HealthRecordsQuery {
        animal: None,
        record_type: None,
    }
)]
#[case(
    "can_find_all_animal_query",
    HealthRecordsQuery {
        animal: Some(Uuid::parse_str("b2bd6270-8bec-42ce-99ff-d0eb1a076221").unwrap()),
        record_type: None,
    }
)]
#[case(
    "can_find_all_record_type_query",
    HealthRecordsQuery {
        animal: None,
        record_type: Some(Cow::Borrowed("fever")),
    }
)]
#[tokio::test]
#[serial]
async fn can_find_all(#[case] test_name: &str, #[case] conditions: HealthRecordsQuery<'_>) {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = HealthRecord::find_all(&ctx.db, org_pid, &conditions).await;

    assert_debug_snapshot!(test_name, result);
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

    let result = HealthRecord::find_by_condition(&ctx.db, "fever", org_pid).await;

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
    let user_pid = Uuid::parse_str("e761d8e3-fc3e-4a2e-a6c9-7c7a4f2130e8").unwrap();

    let params = NewHealthRecord {
        tag_id: Cow::Borrowed("GX006"),
        condition: Cow::Borrowed("vaccination"),
        record_date: Cow::Borrowed("2025-04-12"),
        description: Cow::Borrowed("Innoculation of Rocky against foot and mouth disease"),
        treatment: Cow::Borrowed("vaccine injection"),
        notes: None,
        performed_by: Some(Cow::Borrowed("John Artz")),
        medicine: Some(Cow::Borrowed("Anti-Foot and mouth")),
        dosage: Some(Cow::Borrowed("250")),
        cost: Some(25000),
        prognosis: None,
        status: Cow::Borrowed("active"),
        severity: Cow::Borrowed("low"),
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
async fn can_update_by_id() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("4a0f3af9-e56e-4e21-8f3a-f9e56efe215b").unwrap();

    let params = UpdateHealthRecord {
        condition: None,
        record_date: None,
        description: Some(Cow::Borrowed(
            "Fleecy was vaccinated against Foot and mouth disease",
        )),
        treatment: Some(Cow::Borrowed("vaccine innoculation")),
        notes: Some(Cow::Borrowed(
            "Due to ongoing spread of Foot and mouth disease in nearby districts we have decided to innoculate our animals against this incurrable disease.",
        )),
        performed_by: Some(Cow::Borrowed("John Vetzin")),
        medicine: Some(Cow::Borrowed("Fotivax")),
        dosage: Some(Cow::Borrowed("450")),
        cost: None,
        prognosis: None,
        status: None,
        severity: None,
    };

    let result = HealthRecord::update_by_id(&ctx.db, 105, org_pid, &params).await;

    with_settings!({ filters => {
        crate::cleanup_date().to_vec()
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

#[tokio::test]
#[serial]
async fn can_find_recent_activities() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = HealthRecord::find_recent_activities(&ctx.db, org_pid).await;

    assert_debug_snapshot!(result);
}
