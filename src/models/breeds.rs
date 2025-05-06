#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_const_for_fn)]

use async_trait::async_trait;
use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::{models::species::Specie, seed::Seedable};

use super::{
    ModelError, ModelResult,
    dto::{RegisterBreed, UpdateBreed},
};

#[derive(Debug, Clone, Deserialize)]
pub struct BreedQuery {
    pub specie: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, FromRow, Encode)]
pub struct Breed {
    pub(crate) id: i32,
    pub(crate) specie_id: i32,
    pub(crate) name: String,
    pub(crate) description: Option<String>,
    pub(crate) typical_male_weight_range: Option<String>,
    pub(crate) typical_female_weight_range: Option<String>,
    pub(crate) typical_gestation_period: Option<String>,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
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

    pub async fn create<'e, C>(
        db: C,
        org_pid: Uuid,
        dto: &RegisterBreed<'_>,
        specie_id: i32,
    ) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, Self>(
            "INSERT INTO breeds (specie_id, name, typical_male_weight_range, typical_female_weight_range, typical_gestation_period, organisation_pid, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            ")
        .bind(specie_id)
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

    pub async fn update_by_id<'e, C>(
        db: &C,
        org_pid: Uuid,
        id: i32,
        params: &UpdateBreed<'_>,
    ) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let model = Self::find_by_id(db, id, org_pid).await?;

        let name = params
            .name
            .as_ref()
            .map_or_else(|| model.name.as_str().to_string(), ToString::to_string);
        let description = params
            .description
            .as_ref()
            .map_or_else(|| model.description, |desc| Some(desc.to_string()));
        let male_weight = params.typical_male_weight_range.as_ref().map_or_else(
            || model.typical_male_weight_range,
            |weight| Some(weight.to_string()),
        );
        let female_weight = params.typical_female_weight_range.as_ref().map_or_else(
            || model.typical_female_weight_range,
            |weight| Some(weight.to_string()),
        );
        let gestation_period = params.typical_gestation_period.as_ref().map_or_else(
            || model.typical_gestation_period,
            |period| Some(period.to_string()),
        );

        let specie = if let Some(specie) = params.specie.as_ref() {
            Specie::find_by_name(db, specie).await?
        } else {
            Specie::find_by_id(db, model.specie_id).await?
        };

        let query = sqlx::query_as::<_, Self>(
            "
                UPDATE breeds
                SET specie_id = $3,
                name = $4, description = $5,
                typical_male_weight_range = $6,
                typical_female_weight_range = $7,
                typical_gestation_period = $8
                WHERE id = $1 AND organisation_pid = $2
                RETURNING *
            ",
        )
        .bind(id)
        .bind(org_pid)
        .bind(specie.id())
        .bind(&name)
        .bind(&description)
        .bind(&male_weight)
        .bind(&female_weight)
        .bind(&gestation_period)
        .fetch_one(db)
        .await?;

        Ok(query)
    }
}

#[async_trait]
impl Seedable for Breed {
    async fn seed_data(db: &sqlx::PgPool, breeds: &[Self]) -> ModelResult<()> {
        for breed in breeds {
            sqlx::query("INSERT INTO breeds 
            (id, organisation_pid, specie_id, name, description, is_system_defined, typical_male_weight_range,
            typical_female_weight_range, typical_gestation_period, created_at, updated_at )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )")
            .bind(breed.id)
            .bind(breed.organisation_pid)
            .bind(breed.specie_id)
            .bind(breed.name.as_str())
            .bind(breed.description.as_deref())
            .bind(breed.is_system_defined)
            .bind(breed.typical_male_weight_range.as_deref())
            .bind(breed.typical_female_weight_range.as_deref())
            .bind(breed.typical_gestation_period.as_deref())
            .bind(breed.created_at)
            .bind(breed.updated_at)
            .execute(db)
            .await?;
        }

        Ok(())
    }
}
