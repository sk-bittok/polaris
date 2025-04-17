#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_const_for_fn)]
use std::borrow::Cow;

use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, prelude::FromRow};
use uuid::Uuid;

use super::{ModelError, ModelResult};

#[derive(Debug, Clone, Deserialize)]
pub struct BreedQuery {
    pub specie: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterBreed<'a> {
    pub(crate) specie: Cow<'a, str>,
    pub(crate) name: Cow<'a, str>,
    pub(crate) description: Option<Cow<'a, str>>,
    pub(crate) typical_male_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_female_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_gestation_period: Option<Cow<'a, str>>,
}

impl<'a> RegisterBreed<'a> {
    #[must_use]
    pub fn new(specie: &'a str, name: &'a str) -> Self {
        Self {
            specie: Cow::Borrowed(specie),
            name: Cow::Borrowed(name),
            description: None,
            typical_male_weight_range: None,
            typical_female_weight_range: None,
            typical_gestation_period: None,
        }
    }

    #[must_use]
    pub fn male_weight_range(mut self, weight: &'a str) -> Self {
        self.typical_male_weight_range = Some(Cow::Borrowed(weight));
        self
    }

    #[must_use]
    pub fn female_weight_range(mut self, weight: &'a str) -> Self {
        self.typical_female_weight_range = Some(Cow::Borrowed(weight));
        self
    }

    #[must_use]
    pub fn gestation_period(mut self, period: &'a str) -> Self {
        self.typical_gestation_period = Some(Cow::Borrowed(period));
        self
    }

    #[must_use]
    pub fn description(mut self, period: &'a str) -> Self {
        self.description = Some(Cow::Borrowed(period));
        self
    }
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
}
