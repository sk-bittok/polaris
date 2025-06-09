use std::borrow::Cow;

use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::{
    dto::records::{NewProductionRecord, UpdateProductionRecord},
    production::{ProductionQuery, ProductionRecord},
};
use rstest::rstest;
use serial_test::serial;
use uuid::Uuid;

use crate::{boot_test, seed_data};

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/records");
        settings.set_snapshot_suffix("production");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_find_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("4a0f3af9-e56e-4e21-8f3a-f9e56efe215b").unwrap();

    let result = ProductionRecord::find_by_id(&ctx.db, 103, org_pid).await;

    assert_debug_snapshot!(result);
}

#[rstest]
#[case(
    "can_find_all",
    Uuid::parse_str("4a0f3af9-e56e-4e21-8f3a-f9e56efe215b").unwrap(),
    ProductionQuery {
        product_type: None,
        unit: None,
        animal: None,
    }
)]
#[case(
    "can_find_all_type_query",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    ProductionQuery {
        product_type: Some("milk".to_string()),
        unit: None,
        animal: None
    }
)]
#[case(
    "can_find_all_unit_query",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    ProductionQuery {
        product_type: None,
        unit: Some("litre".into()),
        animal: None
    }
)]
#[case(
    "can_find_all_animal_query",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    ProductionQuery {
        product_type: None,
        unit: None,
        animal: Some(Uuid::parse_str( "b2bd6270-8bec-42ce-99ff-d0eb1a076221").unwrap())
    }
)]
#[tokio::test]
#[serial]
async fn can_find_all(
    #[case] test_name: &str,
    #[case] org_pid: Uuid,
    #[case] conditions: ProductionQuery,
) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = ProductionRecord::find_all(&ctx.db, org_pid, &conditions).await;

    assert_debug_snapshot!(test_name, result);
}

#[tokio::test]
#[serial]
async fn can_create_one() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let params = NewProductionRecord {
        tag_id: Cow::Borrowed("AC005"),
        quantity: 2500,
        quality: Some(Cow::Borrowed("High fat milk")),
        unit: Cow::Borrowed("litre"),
        production_type: Cow::Borrowed("milk"),
        notes: None,
        record_date: None,
    };

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();
    // let animal_pid = Uuid::parse_str("5a6efa8e-8cf3-46fb-9fe6-41900aca729b").unwrap();
    let user_pid = Uuid::parse_str("bd6f7c26-d2c9-487e-b837-8f77be468033").unwrap();

    let result = ProductionRecord::create(&ctx.db, &params, org_pid, user_pid).await;

    with_settings!({ filters => {
            let mut filters = crate::cleanup_date().to_vec();
               filters.extend(crate::cleanup_uuid().to_vec());
               filters.extend(crate::cleanup_int().to_vec());
             filters
        }
    }, {
            assert_debug_snapshot!(result);
        });
}
//<---------------------------------Test-Can-Delete-By-ID-------------------------------------------------------->
#[tokio::test]
#[serial]
async fn can_delete_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = ProductionRecord::delete_by_id(&ctx.db, 101, org_pid).await;

    assert_debug_snapshot!(result);
}

//<---------------------------------Test-Can-Find-Records-By-Livestock-------------------------------------------------------->
#[tokio::test]
#[serial]
async fn can_find_by_animal() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();
    let animal_pid = Uuid::parse_str("b2bd6270-8bec-42ce-99ff-d0eb1a076221").unwrap();

    let result = ProductionRecord::find_by_animal(&ctx.db, org_pid, animal_pid).await;

    assert_debug_snapshot!(result)
}

//<---------------------------------Test-Can-Update-By-ID-------------------------------------------------------->
#[tokio::test]
#[serial]
async fn can_update_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let params = UpdateProductionRecord {
        production_type: None,
        quantity: None,
        quality: Some(Cow::Borrowed("Grade A")),
        notes: None,
        unit: Some(Cow::Borrowed("kg")),
        record_date: None,
    };
    let result = ProductionRecord::update_by_id(&ctx.db, 101, org_pid, &params).await;

    with_settings!({ filters => {
        crate::cleanup_date().to_vec()
        }
    }, {
            assert_debug_snapshot!(result);
        });
}
