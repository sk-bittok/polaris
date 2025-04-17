#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_const_for_fn)]

use async_trait::async_trait;
use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{ModelError, ModelResult, dto::RegisterBreed};

#[derive(Debug, Clone, Deserialize)]
pub struct BreedQuery {
    pub specie: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, FromRow, Encode)]
pub struct Breed {
    pub(crate) id: i32,
    pub(crate) specie: String,
    pub(crate) name: String,
    pub(crate) description: Option<String>,
    pub(crate) typical_male_weight_range: Option<String>,
    pub(crate) typical_female_weight_range: Option<String>,
    pub(crate) typical_gestation_period: Option<String>,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) organisation_pid: Option<Uuid>,
    pub(crate) is_system_defined: bool,
}

impl Breed {
    pub async fn find_by_id<'e, C>(db: C, id: i32, org_pid: Uuid) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>("SELECT * FROM breeds WHERE id = $1 AND (is_system_defined = TRUE OR organisation_pid = $2)")
            .bind(id)
            .bind(org_pid)
            .fetch_optional(db)
            .await?
            .ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn find_by_all<'e, C>(
        db: C,
        org_pid: Uuid,
        conditions: &BreedQuery,
    ) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let mut query =
            sqlx::query_as::<_, Self>("SELECT * FROM breeds WHERE  (is_system_defined = TRUE OR organisation_pid = $1) ORDER BY name")
                .bind(org_pid);

        if let Some(name) = &conditions.name {
            query = sqlx::query_as::<_, Self>(
                "SELECT * FROM breeds WHERE (is_system_defined = TRUE OR organisation_pid = $1) AND name LIKE $2",
            )
            .bind(org_pid)
            .bind(format!("%{name}%"));
        }

        if let Some(specie) = &conditions.specie {
            query = sqlx::query_as::<_, Self>(
                "SELECT * FROM breeds WHERE (is_system_defined = TRUE OR organisation_pid = $1 ) AND specie LIKE $2",
            )
            .bind(org_pid)
            .bind(format!("%{specie}%",));
        }

        query.fetch_all(db).await.map_err(Into::into)
    }

    pub async fn create<'e, C>(db: C, org_pid: Uuid, dto: &RegisterBreed<'_>) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, Self>(
            "INSERT INTO breeds (specie, name, typical_male_weight_range, typical_female_weight_range, typical_gestation_period, organisation_pid, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            ")
        .bind(&dto.specie)
        .bind(&dto.name)
        .bind(&dto.typical_male_weight_range)
        .bind(&dto.typical_female_weight_range)
        .bind(&dto.typical_gestation_period)
        .bind(org_pid)
        .bind(&dto.description)
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn delete_breed<'e, C>(db: C, org_pid: Uuid, id: i32) -> ModelResult<PgQueryResult>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query("DELETE FROM breeds WHERE organisation_pid = $1 AND id = $2")
            .bind(org_pid)
            .bind(id)
            .execute(db)
            .await?;

        Ok(query)
    }

    pub async fn seed(db: &sqlx::PgPool, path: &str) -> ModelResult<()> {
        let breeds = Self::load_file(path).await?;

        Self::seed_data(db, &breeds).await
    }
}

#[async_trait]
impl Seedable for Breed {
    async fn seed_data(db: &sqlx::PgPool, breeds: &[Self]) -> ModelResult<()> {
        for breed in breeds {
            sqlx::query("INSERT INTO breeds 
            (id, organisation_pid, specie, name, description, is_system_defined, typical_male_weight_range, typical_female_weight_range, typical_gestation_period, created_at )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)")
            .bind(breed.id)
            .bind(breed.organisation_pid)
            .bind(breed.specie.as_str())
            .bind(breed.name.as_str())
            .bind(breed.description.as_deref())
            .bind(breed.is_system_defined)
            .bind(breed.typical_male_weight_range.as_deref())
            .bind(breed.typical_female_weight_range.as_deref())
            .bind(breed.typical_gestation_period.as_deref())
            .bind(breed.created_at)
            .execute(db)
            .await?;
        }

        Ok(())
    }
}
