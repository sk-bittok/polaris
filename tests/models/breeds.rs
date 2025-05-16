#![allow(unused)]
use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::{
    breeds::{Breed, BreedQuery},
    dto::{RegisterBreed, UpdateBreed},
    species::Specie,
};
use rstest::rstest;
use serial_test::serial;
use uuid::Uuid;

use crate::{boot_test, cleanup_date, cleanup_int, cleanup_uuid, seed_data};

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("breeds");
        settings.set_snapshot_path("snapshots/breeds");
        let _guard = settings.bind_to_scope();
    };
}

#[rstest]
#[case(
    "can_find_all_no_query",
    BreedQuery { specie: None, name: None }
)]
#[case(
    "can_find_all_specie_query",
    BreedQuery { specie: Some("cattle".into()), name: None }
)]
#[case(
    "can_find_all_name_query",
    BreedQuery { specie: None, name: Some("Hereford".into()) }
)]
#[tokio::test]
#[serial]
async fn can_find_all(#[case] test_name: &str, #[case] query: BreedQuery) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = Breed::find_by_all(&ctx.db, org_pid, &query).await;

    with_settings!(
        {
            filters => {
                let mut filters = cleanup_date().to_vec();
                filters.extend(cleanup_uuid().to_vec());
                filters.extend(cleanup_int().to_vec());
                filters
            }
        },
        {
            assert_debug_snapshot!(test_name, result);
        }
    );
}

#[tokio::test]
#[serial]
async fn can_find_by_id() {
    configure_insta!();
    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = Breed::find_by_id(&ctx.db, 1, org_pid).await;

    with_settings!(
        {
            filters => {
                let mut filters = cleanup_date().to_vec();
                filters.extend(cleanup_uuid().to_vec());
                filters.extend(cleanup_int().to_vec());
                filters
            }
        },
        {
            assert_debug_snapshot!( result);
        }
    );
}

#[tokio::test]
#[serial]
async fn can_create_one() {
    configure_insta!();
    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let mut params = RegisterBreed::new("cattle", "Sussex");

    params = params.male_weight_range("950-1050");
    params = params.female_weight_range("550-670");
    params = params.gestation_period("280 days");
    params = params.description("A dark red cattle breed kept for meat");

    let specie = Specie::find_by_name(&ctx.db, params.specie())
        .await
        .unwrap();

    let result = Breed::create(&ctx.db, org_pid, &params, specie.id()).await;

    with_settings!(
        {
            filters => {
                let mut filters = cleanup_date().to_vec();
                filters.extend(cleanup_uuid().to_vec());
                filters.extend(cleanup_int().to_vec());
                filters
            }
        },
        {
            assert_debug_snapshot!( result);
        }
    );
}

#[tokio::test]
#[serial]
async fn can_delete_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let result = Breed::delete_breed(&ctx.db, org_pid, 100).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_update_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let org_pid = Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap();

    let id = 100;

    let mut params = UpdateBreed::default();

    params = params.description("It is typically light brown in colour, though this can range from being almost grey to dull black, which is known as Mulberry. 
        They can also have white patches which may cover much of the animal. A true Jersey will however always have a black nose bordered by an almost white muzzle.
    The Jersey hard black feet are much less prone to lameness. The Jersey is relatively small in size - about 400 to 450kgs in weight and have a fine but strong frame.");

    params = params.gestation_period("269 days");
    params = params.male_weight_range("550-700 kg");
    params = params.female_weight_range("400-450 kg");

    let result = Breed::update_by_id(&ctx.db, org_pid, id, &params).await;

    with_settings!({
        filters => {
             crate::cleanup_date().to_vec()
        }
    }, {
        assert_debug_snapshot!(result);
    })
}
