#![allow(clippy::missing_errors_doc)]
use std::io::IsTerminal;

use crate::{
    AppContext,
    config::{AppConfig, env::Environment},
    controllers,
    errors::Result,
    models::{orgs::Organisation, users::User},
};

use axum::Router;
use clap::Parser;
use color_eyre::config::{HookBuilder, Theme};
use dotenv::dotenv;
use sqlx::PgPool;
use tokio::net::TcpListener;

#[derive(Debug, Parser)]
#[command(
    version= env!("CARGO_PKG_VERSION"),
    about = "App to handle management of farm livestock",
    author = "Simon Bittok <bittokks@gmail.com>",
)]
pub struct App {
    #[arg(long = "env", short = 'E', default_value_t = Environment::default())]
    env: Environment,
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

        AppContext::from_config(config).await
    }

    pub async fn create_app(&self) -> Result<(TcpListener, Router)> {
        let config = self.config()?;
        let ctx = self.init(&config).await?;
        let listener = TcpListener::bind(config.server().address()).await?;
        let router = controllers::router(&ctx);

        Ok((listener, router))
    }

    pub async fn seed_data(db: &PgPool) -> Result<()> {
        Organisation::seed(db, "organisations.json").await?;
        User::seed(db, "users.json").await?;
        Ok(())
    }
}

impl Default for App {
    fn default() -> Self {
        Self::new()
    }
}
