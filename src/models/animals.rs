#![allow(clippy::missing_errors_doc)]

use async_trait::async_trait;
use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::Deserialize;
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{ModelError, ModelResult, dto::RegisterAnimal};

#[derive(Debug, Deserialize, FromRow, Encode)]
pub struct Animal {
    pub(crate) id: i32,
    pub(crate) pid: Uuid,
    pub(crate) organisation_pid: Uuid,
    pub(crate) tag_id: String,
    pub(crate) name: String,
    pub(crate) specie_id: i32,
    pub(crate) breed_id: i32,
    pub(crate) date_of_birth: Option<NaiveDate>,
    pub(crate) gender: String,
    pub(crate) parent_female_id: Option<Uuid>,
    pub(crate) parent_male_id: Option<Uuid>,
    pub(crate) status: String,
    pub(crate) purchase_date: Option<NaiveDate>,
    pub(crate) purchase_price: Option<Decimal>,
    pub(crate) weight_at_birth: Option<Decimal>,
    pub(crate) current_weight: Option<Decimal>,
    pub(crate) notes: Option<String>,
    pub(crate) created_by: Uuid,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

impl Animal {
    pub async fn find_all<'e, C>(db: C, org_pid: Uuid) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>("SELECT * FROM animals WHERE organisation_pid = $1")
            .bind(org_pid)
            .fetch_all(db)
            .await
            .map_err(Into::into)
    }

    pub async fn find_by_id<'e, C>(db: C, org_pid: Uuid, id: i32) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>("SELECT * FROM animals WHERE id = $1 AND organisation_pid = $2")
            .bind(id)
            .bind(org_pid)
            .fetch_optional(db)
            .await?
            .ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn register<'e, C>(
        db: C,
        org_pid: Uuid,
        user_pid: Uuid,
        params: &RegisterAnimal<'_>,
    ) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let purchase_price = params.purchase_price.map(|price| Decimal::new(price, 2));
        let current_weight = params.current_weight.map(|mass| Decimal::new(mass, 2));
        let birth_weight = params.weight_at_birth.map(|mass| Decimal::new(mass, 2));
        let birth_date = params.date_of_birth.inspect(|f| println!("{f}"));

        let query = sqlx::query_as::<_, Self>("INSERT INTO animals
            (organisation_pid, tag_id, breed_id, specie_id, name, gender, date_of_birth, status, parent_female_id, parent_male_id,
            purchase_date, purchase_price, weight_at_birth, current_weight, notes, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *")
        .bind(org_pid)
        .bind(params.tag_id.as_ref())
        .bind(params.breed_id)
        .bind(params.specie_id)
        .bind(params.name.as_ref())
        .bind(params.gender.as_ref())
        .bind(birth_date)
        .bind(params.status.as_ref())
        .bind(params.female_parent_id.as_ref())
        .bind(params.male_parent_id.as_ref())
        .bind(params.purchase_date.as_ref())
        .bind(purchase_price)
        .bind(birth_weight)
        .bind(current_weight)
        .bind(params.notes.as_deref())
        .bind(user_pid)
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn seed(db: &sqlx::PgPool, path: &str) -> ModelResult<()> {
        let animals = Self::load_file(path).await?;

        Self::seed_data(db, &animals).await
    }

    pub async fn delete_by_id<'e, C>(db: C, org_id: Uuid, id: i32) -> ModelResult<PgQueryResult>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query("DELETE FROM animals WHERE id = $1 AND organisation_pid = $2")
            .bind(id)
            .bind(org_id)
            .execute(db)
            .await
            .map_err(Into::into)
    }
}

#[async_trait]
impl Seedable for Animal {
    async fn seed_data(db: &sqlx::PgPool, animals: &[Self]) -> ModelResult<()> {
        for animal in animals {
            sqlx::query("INSERT INTO animals
                (id, pid, organisation_pid, tag_id, name, specie_id, breed_id, date_of_birth,
                gender, parent_female_id, parent_male_id, status, purchase_date, purchase_price,
                weight_at_birth, current_weight, notes, created_by, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)")
                .bind(animal.id)
                .bind(animal.pid)
                .bind(animal.organisation_pid)
                .bind(animal.tag_id.as_str())
                .bind(animal.name.as_str())
                .bind(animal.specie_id)
                .bind(animal.breed_id)
                .bind(animal.date_of_birth)
                .bind(animal.gender.as_str())
                .bind(animal.parent_female_id)
                .bind(animal.parent_male_id)
                .bind(animal.status.as_str())
                .bind(animal.purchase_date)
                .bind(animal.purchase_price)
                .bind(animal.weight_at_birth)
                .bind(animal.current_weight)
                .bind(animal.notes.as_deref())
                .bind(animal.created_by)
                .bind(animal.created_at)
                .bind(animal.updated_at)
                .execute(db)
                .await?;
        }
        Ok(())
    }
}
