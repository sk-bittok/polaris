use serial_test::serial;

#[serial]
#[tokio::test]
async fn can_seed_data() {
    let boot = crate::boot_test()
        .await
        .inspect_err(|e| eprintln!("{e:?}"))
        .unwrap();

    let seed = crate::seed_data(&boot.db)
        .await
        .inspect_err(|e| eprintln!("{e:?}"));

    assert!(seed.is_ok());
}
