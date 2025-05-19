#![allow(clippy::missing_errors_doc)]
use std::io::IsTerminal;

use crate::{
    AppContext,
    config::{AppConfig, env::Environment},
    controllers,
    errors::Result,
    models::{
        animals::Animal, breeds::Breed, health_records::HealthRecord, orgs::Organisation,
        production_records::ProductionRecord, users::User,
    },
};

use axum::{
    Router,
    http::{
        HeaderValue, Method,
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE, SET_COOKIE},
    },
};
use clap::Parser;
use color_eyre::config::{HookBuilder, Theme};
use dotenv::dotenv;
use sqlx::PgPool;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

#[derive(Debug, Parser)]
#[command(
    version= env!("CARGO_PKG_VERSION"),
    about = "App to handle management of farm livestock",
    author = "Simon Bittok <bittokks@gmail.com>",
)]
pub struct App {
    #[arg(long = "env", short = 'E', default_value_t = Environment::default())]
    env: Environment,
    #[command(subcommand)]
    commands: Option<Commands>,
}

impl App {
    pub async fn run() -> Result<()> {
        dotenv().ok();

        HookBuilder::default().theme(if std::io::stdout().is_terminal() {
            Theme::dark()
        } else {
            Theme::new()
        });
        let cli = Self::parse();
        let config = cli.config()?;
        let (listener, router) = cli.create_app().await?;

        println!("Running on {}", config.server.url());
        axum::serve(listener, router).await?;
        Ok(())
    }

    #[must_use]
    pub fn new() -> Self {
        Self::parse()
    }

    pub fn config(&self) -> Result<AppConfig> {
        AppConfig::deserialise_yaml(&self.env).map_err(Into::into)
    }

    pub async fn init(&self, config: &AppConfig) -> Result<AppContext> {
        config.logger().setup()?;
        config.database().init().await?;

        let ctx = AppContext::from_config(config).await?;

        match &self.commands {
            Some(Commands::Seed) => Self::seed_data(&ctx.db).await?,
            None => {}
        }

        Ok(ctx)
    }

    pub async fn create_app(&self) -> Result<(TcpListener, Router)> {
        let config = self.config()?;
        let ctx = self.init(&config).await?;
        let listener: TcpListener = TcpListener::bind(config.server().address()).await?;

        let cors_layer: CorsLayer = CorsLayer::new()
            .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
            .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
            .allow_origin("http://127.0.0.1:3000".parse::<HeaderValue>()?)
            .allow_credentials(true)
            .expose_headers([AUTHORIZATION, SET_COOKIE]);

        let app: Router = Router::new()
            .nest("/api", controllers::router(ctx))
            .layer(cors_layer);

        Ok((listener, app))
    }

    pub async fn seed_data(db: &PgPool) -> Result<()> {
        Organisation::seed(db, "organisations.json").await?;
        User::seed(db, "users.json").await?;
        Breed::seed(db, "breeds.json").await?;
        Animal::seed(db, "animals.json").await?;
        ProductionRecord::seed(db, "productionRecords.json").await?;
        HealthRecord::seed(db, "healthRecords.json").await?;
        Ok(())
    }
}

impl Default for App {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(clap::Subcommand, Debug, Clone)]
enum Commands {
    /// Seeds data to the Database
    #[clap(alias("s"))]
    Seed,
}
