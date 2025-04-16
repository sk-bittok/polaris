#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_const_for_fn)]
use std::time::Duration;

use serde::{Deserialize, Serialize};
use sqlx::{PgPool, migrate::Migrator, postgres::PgPoolOptions};

use super::ConfigResult;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DatabaseConfig {
    pub(crate) url: String,
    pub(crate) connection_timeout: u64,
    pub(crate) idle_timeout: u64,
    pub(crate) max_connections: u32,
    pub(crate) min_connections: u32,
    pub(crate) auto_migrate: bool,
    pub(crate) recreate: bool,
}

impl DatabaseConfig {
    pub async fn init(&self) -> ConfigResult<()> {
        if self.recreate {
            self.recreate().await?;
        } else if self.auto_migrate {
            self.migrate().await?;
        }

        Ok(())
    }

    pub fn connection_pool(&self) -> ConfigResult<PgPool> {
        PgPoolOptions::new()
            .max_connections(self.max_connections)
            .min_connections(self.min_connections)
            .idle_timeout(Duration::from_secs(self.idle_timeout))
            .acquire_timeout(Duration::from_secs(self.connection_timeout))
            .connect_lazy(&self.url)
            .map_err(Into::into)
    }

    async fn migrator(&self) -> ConfigResult<Migrator> {
        let base_dir = std::env::current_dir()?;
        let migrations_dir = base_dir.join("migrations");

        Migrator::new(migrations_dir).await.map_err(Into::into)
    }

    pub async fn migrate(&self) -> ConfigResult<()> {
        let migrator = self.migrator().await?;

        migrator
            .run(&self.connection_pool()?)
            .await
            .map_err(Into::into)
    }

    #[allow(clippy::cast_possible_wrap)]
    pub async fn revert(&self) -> ConfigResult<()> {
        let migrator = self.migrator().await?;

        migrator
            .undo(&self.connection_pool()?, migrator.iter().count() as i64)
            .await
            .map_err(Into::into)
    }

    pub async fn recreate(&self) -> ConfigResult<()> {
        self.revert().await?;

        self.migrate().await
    }

    #[must_use]
    pub fn url(&self) -> &str {
        &self.url
    }
}
