mod models;
mod requests;

use axum_test::{TestServer, TestServerConfig};
use polaris::{App, AppConfig, AppContext, Environment, Result, controllers};
use sqlx::PgPool;

use std::{future::Future, sync::OnceLock};

pub async fn boot_test() -> Result<AppContext> {
    let config = AppConfig::deserialise_yaml(&Environment::Testing)
        .inspect(|c| println!("{:#?}", c))
        .inspect_err(|e| eprintln!("{e:?}"))?;
    let context = AppContext::from_config(&config).await?;

    context.init().await?;

    Ok(context)
}

pub async fn request<F, Fut>(f: F)
where
    F: FnOnce(TestServer, AppContext) -> Fut,
    Fut: Future<Output = ()>,
{
    let config: AppConfig = AppConfig::deserialise_yaml(&Environment::Testing)
        .expect("Failed to build AppConfig from file");

    let context: AppContext = AppContext::from_config(&config).await.unwrap();

    context
        .init()
        .await
        .inspect_err(|e| eprintln!("{:?}", e))
        .unwrap();

    let config = TestServerConfig {
        default_content_type: Some("application/json".into()),
        save_cookies: true,
        ..Default::default()
    };

    let server = TestServer::new_with_config(controllers::router(context.clone()), config)
        .expect("Failed to start TestServer");

    f(server, context).await
}

pub async fn seed_data(db: &PgPool) -> Result<()> {
    App::seed_data(db).await
}

static CLEANUP_UUID: OnceLock<Vec<(&'static str, &'static str)>> = OnceLock::new();
static CLEANUP_DATE: OnceLock<Vec<(&'static str, &'static str)>> = OnceLock::new();
static CLEANUP_INT: OnceLock<Vec<(&'static str, &'static str)>> = OnceLock::new();
static CLEANUP_PASSWORD: OnceLock<Vec<(&'static str, &'static str)>> = OnceLock::new();
static CLEANUP_JWT: OnceLock<Vec<(&'static str, &'static str)>> = OnceLock::new();
static CLEANUP_HEADERS: OnceLock<Vec<(&'static str, &'static str)>> = OnceLock::new();

pub fn cleanup_uuid() -> &'static Vec<(&'static str, &'static str)> {
    CLEANUP_UUID.get_or_init(|| {
        vec![(
            r"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})",
            "PID",
        )]
    })
}

pub fn cleanup_date() -> &'static Vec<(&'static str, &'static str)> {
    CLEANUP_DATE.get_or_init(|| {
        vec![
            (
                r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?\+\d{2}:\d{2}",
                "DATE",
            ), // with tz
            (r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+", "DATE"),
            (r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})", "DATE"),
            (r"(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})", "DATE"),
            (r#"\d{2}-\d{2}-\d{4} \d{2}:\d{2}"#, "DATE"),
            (r"\d{4}[-/]\d{2}[-/]\d{2}", "DATE"),
        ]
    })
}

// pub fn cleanup_id() -> &'static Vec<(&'static str, &'static str)> {
//     CLEANUP_INT.get_or_init(|| {
//         vec![
//             (r"id:\s*(\d+)", "id: ID"),    // Match "id:" followed by an integer
//             (r"id\s*:\s*(\d+)", "id: ID"), // More flexible matching with potential spaces
//             (r#""id"\s*:\s*\d+"#, r#""id": ID"#),
//             (r"id:\d+,", "id: ID"), // New patterns for your specific JSON format
//             // Matches `"specie_id":456,`  or  `"specie_id":456}`
//             (r#""specie_id":\s*\d+([,}])"#, r#""specie_id": ID$1"#),
//             (r#""(id|specie_id)"\s*:\s*\d+"#, r#"$1"ID""#),
//         ]
//     })
// }

pub fn cleanup_int() -> &'static Vec<(&'static str, &'static str)> {
    CLEANUP_INT.get_or_init(|| vec![(r"id: \d+,", "id: ID"), (r"id:\d+,", "id: ID")])
}

pub fn cleanup_password() -> &'static Vec<(&'static str, &'static str)> {
    CLEANUP_PASSWORD
        .get_or_init(|| vec![(r"password_hash: (.*{60}),", "password_hash: \"PASSWORD\",")])
}

pub fn cleanup_jwt() -> &'static Vec<(&'static str, &'static str)> {
    CLEANUP_JWT.get_or_init(|| vec![(r"[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+", "JWT")])
}

pub fn cleanup_headers() -> &'static Vec<(&'static str, &'static str)> {
    CLEANUP_HEADERS.get_or_init(|| {
        vec![(
            r#""content-length":\s*"\d+""#,
            r#""content-length": "NUMBER""#,
        )]
    })
}
