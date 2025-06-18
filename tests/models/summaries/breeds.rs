use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::{BreedSummary, BreedSummaryExtract, BreedSummaryQuery};
use rstest::rstest;
use serial_test::serial;
use uuid::Uuid;

use crate::{boot_test, cleanup_date, cleanup_int, cleanup_uuid, seed_data};

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("breeds");
        settings.set_snapshot_path("snapshots/summaries");
        let _guard = settings.bind_to_scope();
    };
}

#[rstest]
#[case(
    "can_find_summary_org_a",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    "cattle",
    "Jersey",
)]
#[case(
    "can_find_summary_org_b",
    Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap(),
    "goats",
    "Kalahari",
)]
#[tokio::test]
#[serial]
async fn can_extract_summary_data(
    #[case] test_name: &str,
    #[case] org_pid: Uuid,
    #[case] specie: &str,
    #[case] breed: &str,
) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = BreedSummaryExtract::get_from_animals(&ctx.db, org_pid, breed, specie).await;

    assert_debug_snapshot!(test_name, result);
}

#[rstest]
#[case(
    "can_generate_summary_org_a",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    "cattle",
    "Jersey",
)]
#[case(
    "can_generate_summary_org_b",
    Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap(),
    "goats",
    "Kalahari",
)]
#[tokio::test]
#[serial]
async fn can_generate_summary_data(
    #[case] test_name: &str,
    #[case] org_pid: Uuid,
    #[case] specie: &str,
    #[case] breed: &str,
) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = BreedSummary::generate(&ctx.db, org_pid, breed, specie).await;

    with_settings!({
        filters => {
            let mut filters = cleanup_date().to_vec();
            filters.extend(cleanup_uuid().to_vec());
            filters.extend(cleanup_int().to_vec());
            filters
        }
    }, {
        assert_debug_snapshot!(test_name, result);
    });
}

#[rstest]
#[case(
    "can_find_list_summary",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    "cattle",
    "Jersey",
    BreedSummaryQuery {
        specie: None,
        breed: None,
    }
)]
#[rstest]
#[case(
    "can_find_list_summary_specie_query",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    "cattle",
    "Jersey",
    BreedSummaryQuery {
        specie: Some("cattle".to_string()),
        breed: None
    }
)]
#[rstest]
#[case(
    "can_find_list_summary_all_query",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
    "cattle",
    "Friesian",
    BreedSummaryQuery {
        specie: Some("cattle".to_string()),
        breed: Some("friesian".to_string()),
    }
)]
#[case(
    "can_find_list_summary_breed_query",
    Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap(),
    "goats",
    "Kalahari",
   BreedSummaryQuery {  
        specie: None,
        breed: Some( "Kalahari".to_string()), 
    }
)]
#[tokio::test]
#[serial]
async fn test_can_find_list(
    #[case] test_name: &str,
    #[case] org_pid: Uuid,
    #[case] specie: &str,
    #[case] breed: &str,
    #[case] params: BreedSummaryQuery,
) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    BreedSummary::generate(&ctx.db, org_pid, breed, specie).await.unwrap();

   let result = BreedSummary::find_list(&ctx.db, org_pid, &params).await;

    with_settings!({
        filters => {
            let mut filters = cleanup_date().to_vec();
            filters.extend(cleanup_uuid().to_vec());
            filters.extend(cleanup_int().to_vec());
            filters
        }
    }, {
        assert_debug_snapshot!(test_name, result);
    });
    
}
