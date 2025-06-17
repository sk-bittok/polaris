use insta::{Settings, assert_debug_snapshot, with_settings};
use polaris::models::livestock::{LivestockSummary, SummaryData};
use rstest::rstest;
use serial_test::serial;
use uuid::Uuid;

use crate::{boot_test, cleanup_date, cleanup_int, cleanup_uuid, seed_data};

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("livestock");
        settings.set_snapshot_path("snapshots/summaries");
        let _guard = settings.bind_to_scope();
    };
}

#[rstest]
#[case(
    "can_find_summary_org_a",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
)]
#[case(
    "can_find_summary_org_b",
    Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap(),
)]
#[tokio::test]
#[serial]
async fn can_find_summary_data(#[case] test_name: &str, #[case] org_pid: Uuid) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = SummaryData::find_by_organisation(&ctx.db, org_pid).await;

    assert_debug_snapshot!(test_name, result);
}

#[rstest]
#[case(
    "can_generate_summary_org_a",
    Uuid::parse_str("9d5b0c1e-6a48-4bce-b818-dc8c015fd8a0").unwrap(),
)]
#[case(
    "can_generate_summary_org_b",
    Uuid::parse_str("4a93f0a8-4a91-482d-92d8-f0b3b084c2e4").unwrap(),
)]
#[tokio::test]
#[serial]
async fn can_generate_summary(#[case] test_name: &str, #[case] org_pid: Uuid) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db).await.unwrap();

    let result = LivestockSummary::generate(&ctx.db, org_pid).await;

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
