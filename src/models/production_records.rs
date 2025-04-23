#![allow(clippy::missing_errors_doc)]
use std::str::FromStr;

use async_trait::async_trait;
use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::Deserialize;
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{ModelError, ModelResult, dto::records::NewProductionRecord};

#[derive(Debug, Deserialize, Clone)]
pub struct ProductionQuery {
    pub product_type: Option<String>,
    pub unit: Option<String>,
}

#[derive(Debug, Deserialize, FromRow, Encode, Clone)]
pub struct ProductionRecord {
    pub(crate) id: i32,
    pub(crate) animal_pid: Uuid,
    pub(crate) organisation_pid: Uuid,
    pub(crate) product_type: String,
    pub(crate) quantity: Decimal,
    pub(crate) unit: String,
    pub(crate) record_date: NaiveDate,
    pub(crate) quality: Option<String>,
    pub(crate) notes: Option<String>,
    pub(crate) created_by: Uuid,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

impl ProductionRecord {
    pub async fn find_all<'a, C>(
        db: C,
        org_pid: Uuid,
        conditions: &ProductionQuery,
    ) -> ModelResult<Vec<Self>>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let mut query = sqlx::query_as::<_, Self>(
            "SELECT * FROM production_records WHERE organisation_pid = $1",
        )
        .bind(org_pid);

        if let Some(product_type) = &conditions.product_type {
            query = sqlx::query_as::<_, Self>(
            "SELECT * FROM production_records WHERE organisation_pid = $1 AND product_type LIKE $2"
            )
            .bind(org_pid)
            .bind(format!("%{product_type}%"));
        }

        if let Some(unit) = &conditions.unit {
            query = sqlx::query_as::<_, Self>(
                "SELECT * FROM production_records WHERE organisation_pid = $1 AND unit LIKE $2",
            )
            .bind(org_pid)
            .bind(format!("%{unit}%"));
        }

        query.fetch_all(db).await.map_err(Into::into)
    }

    pub async fn find_by_id<'a, C>(db: C, id: i32, org_pid: Uuid) -> ModelResult<Self>
    where
        C: Executor<'a, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>(
            "SELECT * FROM production_records WHERE id = $1 AND organisation_pid = $2",
        )
        .bind(id)
        .bind(org_pid)
        .fetch_optional(db)
        .await?
        .ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn create<'a, C>(
        db: C,
        params: &NewProductionRecord<'_>,
        animal_pid: Uuid,
        org_pid: Uuid,
        user_pid: Uuid,
    ) -> ModelResult<Self>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let date = if let Some(date) = &params.date {
            NaiveDate::from_str(date)?
        } else {
            chrono::Local::now().date_naive()
        };

        let item = sqlx::query_as::<_, Self>("
                    INSERT INTO production_records
                    (animal_pid, organisation_pid, created_by, product_type, quantity, unit, quality, notes, record_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
                ")
                .bind(animal_pid)
                .bind(org_pid)
                .bind(user_pid)
                .bind(params.production_type.as_ref())
                .bind(Decimal::new(params.quantity, 2))
                .bind(params.unit.as_ref())
                .bind(params.quality.as_deref())
                .bind(params.notes.as_deref())
                .bind(date)
                .fetch_one(db)
                .await?;

        Ok(item)
    }

    pub async fn delete_by_id<'e, C>(db: C, id: i32, org_pid: Uuid) -> ModelResult<PgQueryResult>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let query =
            sqlx::query("DELETE FROM production_records WHERE id = $1 AND organisation_pid = $2 ")
                .bind(id)
                .bind(org_pid)
                .execute(db)
                .await?;

        Ok(query)
    }

    pub async fn seed(db: &sqlx::PgPool, path: &str) -> ModelResult<()> {
        let records = Self::load_file(path).await?;

        Self::seed_data(db, &records).await
    }
}

#[async_trait]
impl Seedable for ProductionRecord {
    async fn seed_data(db: &sqlx::PgPool, records: &[Self]) -> ModelResult<()> {
        for record in records {
            sqlx::query("INSERT INTO production_records
                (id, animal_pid, organisation_pid, product_type, quantity, unit, quality, record_date, notes, created_by, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
            )
            .bind(record.id)
            .bind(record.animal_pid)
            .bind(record.organisation_pid)
            .bind(record.product_type.as_str())
            .bind(record.quantity)
            .bind(record.unit.as_str())
            .bind(record.quality.as_ref())
            .bind(record.record_date)
            .bind(record.notes.as_ref())
            .bind(record.created_by)
            .bind(record.created_at)
            .bind(record.updated_at)
            .execute(db)
            .await?;
        }

        Ok(())
    }
}
