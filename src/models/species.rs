#![allow(clippy::missing_errors_doc)]
use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, prelude::FromRow};

use super::{ModelError, ModelResult};

#[derive(Debug, Deserialize, Serialize, Clone, FromRow, Encode)]
pub struct Specie {
    pub(crate) id: i32,
    pub(crate) name: String,
    pub(crate) description: Option<String>,
    pub(crate) created_at: DateTime<FixedOffset>,
}

impl Specie {
    pub async fn find_by_name<'e, C>(db: C, name: &str) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, Self>("SELECT * FROM species WHERE name = $1")
            .bind(name)
            .fetch_optional(db)
            .await?;

        query.ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn find_by_id<'e, C>(db: C, id: i32) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, Self>("SELECT * FROM species WHERE id = $1")
            .bind(id)
            .fetch_optional(db)
            .await?;

        query.ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn find_by_all<'e, C>(db: C) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let species = sqlx::query_as::<_, Self>("SELECT * FROM species WHERE")
            .fetch_all(db)
            .await?;

        Ok(species)
    }
}
