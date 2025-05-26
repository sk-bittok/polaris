use std::borrow::Cow;

use chrono::NaiveDate;
use insta::{assert_debug_snapshot, with_settings, Settings};
use polaris::models::{dto::records::NewWeightRecord, weight::{WeightQuery, WeightRecord}};
use rstest::rstest;
use rust_decimal::Decimal;
use serial_test::serial;
use uuid::Uuid;

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/records");
        settings.set_snapshot_suffix("weight");
        let _guard = settings.bind_to_scope();
    };
}

#[rstest]
#[case(
    "can_find_all",
    WeightQuery {
        animal: None,
        mass: None,
    },
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap()
)]
#[case(
    "can_find_all_animal_query",
    WeightQuery {
        animal: Some( Uuid::parse_str("f6417c11-d817-4626-9e8d-c68a44002d4b").unwrap()),
        mass: None,
    },
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap()
)]
#[case(
    "can_find_all_mass_query",
    WeightQuery {
        animal:None, 
        mass: Some(Decimal::new(70, 0)),
    },
    Uuid::parse_str("4a0f3af9-e56e-4e21-8f3a-f9e56efe215b").unwrap()
)]
#[tokio::test]
#[serial]
async fn can_find_all(
    #[case] test_name: &str,
    #[case] conditions: WeightQuery,
    #[case] org_pid: Uuid,
) {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let results = WeightRecord::find_all(&ctx.db, org_pid, &conditions).await;

    assert_debug_snapshot!(test_name, results);
}


#[tokio::test]
#[serial]
async fn can_find_by_id() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid =  Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let results = WeightRecord::find_by_id(&ctx.db, org_pid, 115).await;

    assert_debug_snapshot!(results);
}


#[tokio::test]
#[serial]
async fn can_delete_one() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid =  Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let results = WeightRecord::delete_by_id(&ctx.db, org_pid, 115).await;

    assert_debug_snapshot!(results);
}

#[tokio::test]
#[serial]
async fn can_create_one() {
    configure_insta!();

    let ctx = crate::boot_test().await.unwrap();
    crate::seed_data(&ctx.db).await.unwrap();

    let org_pid =  Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();
    let user_pid =  Uuid::parse_str("bd6f7c26-d2c9-487e-b837-8f77be468033").unwrap();

    let params = NewWeightRecord {
        tag_id: Cow::Borrowed("AC007"),
        record_date: NaiveDate::parse_from_str("2025-04-22", "%Y-%m-%d").unwrap(),
        mass: 48800,
        notes: None
    };

    let results = WeightRecord::create(&ctx.db, &params, org_pid, user_pid).await;

    with_settings!({
        filters => {
            let mut filters = crate::cleanup_uuid().to_vec();
            filters.extend(crate::cleanup_date().to_vec());
            filters.extend(crate::cleanup_int().to_vec());
            filters
        }
    }, {
        assert_debug_snapshot!(results);
    })
}
