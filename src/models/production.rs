#![allow(clippy::missing_errors_doc)]
use std::str::FromStr;

use async_trait::async_trait;
use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{ModelError, ModelResult, dto::records::NewProductionRecord};

#[derive(Debug, Deserialize, Clone)]
pub struct ProductionQuery {
    pub product_type: Option<String>,
    pub unit: Option<String>,
    pub animal: Option<Uuid>,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Encode, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProductionRecordCleaned {
    pub id: i32,
    pub animal_name: String,
    pub animal_pid: Uuid,
    pub animal_tag_id: String,
    pub organisation_name: String,
    pub organisation_pid: Uuid,
    pub product_type: String,
    pub quantity: Decimal,
    pub unit: String,
    pub record_date: NaiveDate,
    pub quality: Option<String>,
    pub notes: Option<String>,
    pub created_by: Uuid,
    pub created_by_name: String,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, FromRow, Encode, Clone, Serialize)]
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

const FETCH_ALL_QUERY: &str = "
    SELECT
        pr.id,
        a.name AS animal_name,
        b.tag_id AS animal_tag_id,
        pr.animal_pid,
        o.name AS organisation_name,
        pr.organisation_pid,
        pr.product_type,
        pr.quantity,
        pr.unit,
        pr.record_date,
        pr.quality,
        pr.notes,
        pr.created_at,
        pr.updated_at,
        pr.created_by,
        CONCAT(u.first_name, ' ', u.last_name) AS created_by_name
    FROM
        production_records pr
    LEFT JOIN
        animals a ON pr.animal_pid = a.pid
    LEFT JOIN
        animals b ON pr.animal_pid = b.pid
    LEFT JOIN
        organisations o ON pr.organisation_pid = o.pid
    LEFT JOIN
        users u ON pr.created_by = u.pid
    WHERE
        pr.organisation_pid = $1
";

fn fetch_query(conditions: &str) -> String {
    format!("{FETCH_ALL_QUERY} {conditions}")
}

impl ProductionRecord {
    pub async fn find_all<'a, C>(
        db: C,
        org_pid: Uuid,
        conditions: &ProductionQuery,
    ) -> ModelResult<Vec<ProductionRecordCleaned>>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let mut query = sqlx::query_as::<_, ProductionRecordCleaned>(FETCH_ALL_QUERY).bind(org_pid);

        if let Some(product_type) = &conditions.product_type {
            let fetch_query = fetch_query("AND product_type ILIKE $2");
            query = sqlx::query_as::<_, ProductionRecordCleaned>(Box::leak(
                fetch_query.into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(format!("%{product_type}%"));
        }

        if let Some(unit) = &conditions.unit {
            let fetch_query = fetch_query("AND unit ILIKE $2");
            query = sqlx::query_as::<_, ProductionRecordCleaned>(Box::leak(
                fetch_query.into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(format!("%{unit}%"));
        }

        if let Some(pid) = conditions.animal {
            let fetch_query = fetch_query("AND pr.animal_pid = $2");
            query = sqlx::query_as(Box::leak(fetch_query.into_boxed_str()))
                .bind(org_pid)
                .bind(pid);
        }

        query.fetch_all(db).await.map_err(Into::into)
    }

    pub async fn find_by_id<'a, C>(
        db: C,
        id: i32,
        org_pid: Uuid,
    ) -> ModelResult<ProductionRecordCleaned>
    where
        C: Executor<'a, Database = Postgres>,
    {
        sqlx::query_as::<_, ProductionRecordCleaned>(Box::leak(
            fetch_query("AND pr.id = $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(id)
        .fetch_optional(db)
        .await?
        .ok_or_else(|| ModelError::EntityNotFound)
    }

    #[tracing::instrument(name = "Add new production record", skip(db))]
    pub async fn create<'a, C>(
        db: C,
        params: &NewProductionRecord<'_>,
        org_pid: Uuid,
        user_pid: Uuid,
    ) -> ModelResult<Self>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let date = if let Some(date) = &params.record_date {
            NaiveDate::from_str(date)?
        } else {
            chrono::Local::now().date_naive()
        };

        let item = sqlx::query_as::<_, Self>(
            "
                    INSERT INTO production_records
                    (
                        animal_pid,
                        organisation_pid, 
                        created_by,
                        product_type,
                        quantity,
                        unit,
                        quality,
                        notes,
                        record_date
                    )
                    VALUES
                    (
                        (SELECT pid FROM animals a WHERE a.tag_id = $1 AND a.organisation_pid = $2),
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9
                    )
                    RETURNING *
                ",
        )
        .bind(params.tag_id.as_ref())
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

    pub async fn find_by_animal<'e, C>(
        db: &C,
        org_pid: Uuid,
        animal_pid: Uuid,
    ) -> ModelResult<Vec<ProductionRecordCleaned>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, ProductionRecordCleaned>(Box::leak(
            fetch_query("AND animal_pid = $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(animal_pid)
        .fetch_all(db)
        .await?;

        Ok(query)
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
