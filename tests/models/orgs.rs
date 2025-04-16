use std::borrow::Cow;

use insta::{Settings, assert_debug_snapshot};
use polaris::models::{
    enums::Subscription,
    orgs::{Organisation, OrganisationQuery, RegisterOrg},
};
use rstest::rstest;
use serial_test::serial;

use crate::{boot_test, cleanup_date, cleanup_int, cleanup_uuid, seed_data};

macro_rules! configure_insta {
    ($(expr:expr),*) => {
        let mut settings = Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_path("snapshots/organisations");
        settings.set_snapshot_suffix("orgs");
        let _guard = settings.bind_to_scope();
    };
}

#[tokio::test]
#[serial]
async fn can_create_one() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();

    let params = RegisterOrg {
        name: Cow::Borrowed("Polaris Inc"),
        address: Some(Cow::Borrowed("45 Drury Lane")),
        phone: None,
        email: Some(Cow::Borrowed("polaris@mail.com")),
        subscription_type: Some(Cow::Borrowed("Enterprise")),
    };

    let result = Organisation::create(&ctx.db, &params)
        .await
        .inspect_err(|e| eprintln!("{e:?}"));

    insta::with_settings!({
        filters => {
            let mut filters = cleanup_date().to_vec();
            filters.extend(cleanup_uuid().to_vec());
            filters.extend(cleanup_int().to_vec());
            filters
        }
    }, {
        assert_debug_snapshot!(result);
    })
}

#[rstest]
#[case("can_fetch_without_conditions", OrganisationQuery::default())]
#[case(
    "can_fetch_with_basic_condition",
    OrganisationQuery::new(Subscription::Basic)
)]
#[case(
    "can_fetch_with_business_condition",
    OrganisationQuery::new(Subscription::Business)
)]
#[case(
    "can_fetch_with_enterprise_condition",
    OrganisationQuery::new(Subscription::Enterprise)
)]
#[tokio::test]
#[serial]
async fn can_fetch_all(#[case] test_name: &str, #[case] query: OrganisationQuery) {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db)
        .await
        .inspect_err(|e| eprintln!("{e:?}"))
        .unwrap();

    let result = Organisation::read_all(&ctx.db, &query).await;

    assert_debug_snapshot!(test_name, result);
}

#[tokio::test]
#[serial]
async fn can_fetch_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db)
        .await
        .inspect_err(|e| eprintln!("{e:?}"))
        .unwrap();

    let result = Organisation::read_one(&ctx.db, 1).await;

    assert_debug_snapshot!(result);
}

#[tokio::test]
#[serial]
async fn can_delete_by_id() {
    configure_insta!();

    let ctx = boot_test().await.unwrap();
    seed_data(&ctx.db)
        .await
        .inspect_err(|e| eprintln!("{e:?}"))
        .unwrap();

    let result = Organisation::delete_by_id(&ctx.db, 2).await;

    assert_debug_snapshot!(result);
}
