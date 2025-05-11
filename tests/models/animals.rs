#![allow(unused)]
use std::{borrow::Cow, str::FromStr};

use chrono::NaiveDate;
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::{
    animals::{Animal, AnimalQuery},
    dto::RegisterAnimal,
};
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

#[rstest]
#[case(
    "can_find_all_no_query",
    Uuid::parse_str( "9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
     AnimalQuery {
        specie: None,
        breed: None,
        purchase_date: None,
    }
)]
#[case(
    "can_find_all_specie_query",
    Uuid::parse_str( "9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
     AnimalQuery {
        specie: Some("cattle".to_string()),
        breed: None,
        purchase_date: None,
    }
)]
#[case(
    "can_find_all_breed_query",
    Uuid::parse_str("4a0f3af9-e56e-4e21-8f3a-f9e56efe215b").unwrap(),
     AnimalQuery {
        specie: None,
        breed: Some("Merino".into()),
        purchase_date: None,
    }
)]
#[tokio::test]
#[serial]
async fn can_find_all(#[case] name: &str, #[case] org_pid: Uuid, #[case] conditions: AnimalQuery) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = Animal::find_all(&ctx.db, org_pid, &conditions).await;

    assert_debug_snapshot!(name, result);
}

#[rstest]
#[case(
    "can_find_by_id",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    101
)]
#[case(
    "can_find_by_id_wrong_id",
    Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap(),
    101
)]
#[tokio::test]
#[serial]
async fn can_find_by_id(#[case] test_name: &str, #[case] org_pid: Uuid, #[case] id: i32) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = Animal::find_by_id(&ctx.db, org_pid, id).await;

    assert_debug_snapshot!(test_name, result);
}

#[tokio::test]
#[serial]
async fn can_create_one() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let user_pid = Uuid::parse_str("e761d8e3-fc3e-4a2e-a6c9-7c7a4f2130e8").unwrap();
    let org_pid = Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap();

    let params = RegisterAnimal {
        tag_id: Cow::Borrowed("GX027"),
        name: Cow::Borrowed("Monkey Blue"),
        gender: Cow::Borrowed("male"),
        status: Cow::Borrowed("active"),
        specie: Cow::Borrowed("cattle"),
        breed: Cow::Borrowed("beef shorthorn"),
        date_of_birth: Some(Cow::Borrowed("2023-12-17")),
        female_parent_id: None,
        male_parent_id: None,
        purchase_date: None,
        purchase_price: None,
        weight_at_birth: Some(3600),
        current_weight: None,
        notes: None,
    };

    let result = Animal::register(&ctx.db, org_pid, user_pid, &params).await;

    with_settings!({
        filters => {
            let mut filters = cleanup_date().to_vec();
            filters.extend(cleanup_uuid().to_vec());
            filters.extend(cleanup_int().to_vec());
            filters
        }
    }, {
        assert_debug_snapshot!(result);
        });
}

#[tokio::test]
#[serial]
async fn can_create_one_with_parents() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let user_pid = Uuid::parse_str("bd6f7c26-d2c9-487e-b837-8f77be468033").unwrap();
    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let params = RegisterAnimal {
        tag_id: Cow::Borrowed("GX027"),
        name: Cow::Borrowed("Josephone"),
        gender: Cow::Borrowed("female"),
        status: Cow::Borrowed("active"),
        specie: Cow::Borrowed("cattle"),
        breed: Cow::Borrowed("beef shorthorn"),
        date_of_birth: Some(Cow::Borrowed("2023-12-25")),
        female_parent_id: Some(Cow::Borrowed("AC001")),
        male_parent_id: Some(Cow::Borrowed("AC003")),
        purchase_date: None,
        purchase_price: None,
        weight_at_birth: Some(3600),
        current_weight: Some(55000),
        notes: None,
    };

    let result = Animal::register(&ctx.db, org_pid, user_pid, &params).await;

    with_settings!({
        filters => {
            let mut filters = cleanup_date().to_vec();
            filters.extend(cleanup_uuid().to_vec());
            filters.extend(cleanup_int().to_vec());
            filters
        }
    }, {
        assert_debug_snapshot!(result);
        });
}
