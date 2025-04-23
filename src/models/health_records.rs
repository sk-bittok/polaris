#![allow(clippy::missing_errors_doc)]

use std::str::FromStr;

use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{ModelError, ModelResult, dto::records::NewHealthRecord};

#[derive(Debug, Deserialize, Serialize, FromRow, Encode)]
pub struct HealthRecord {
    pub(crate) id: i32,
    pub(crate) animal_pid: Uuid,
    pub(crate) organisation_pid: Uuid,
    pub(crate) record_type: String,
    pub(crate) record_date: NaiveDate,
    pub(crate) description: String,
    pub(crate) treatment: Option<String>,
    pub(crate) medicine: Option<String>,
    pub(crate) dosage: Option<String>,
    pub(crate) cost: Option<Decimal>,
    pub(crate) performed_by: Option<String>,
    pub(crate) notes: Option<String>,
    pub(crate) created_by: Uuid,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

impl HealthRecord {
    pub async fn create<'a, C>(
        db: C,
        params: &NewHealthRecord<'_>,
        org_pid: Uuid,
        user_pid: Uuid,
        animal_pid: Uuid,
    ) -> ModelResult<Self>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let record_date = NaiveDate::from_str(&params.date)?;

        let record = sqlx::query_as::<_, Self>(
            "INSERT INTO health_records 
            (animal_pid, organisation_pid, created_by, record_type, record_date,
            description, treatment, medicine, dosage, cost, performed_by, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING * ",
        )
        .bind(animal_pid)
        .bind(org_pid)
        .bind(user_pid)
        .bind(params.record_type.as_ref())
        .bind(record_date)
        .bind(params.description.as_ref())
        .bind(params.treatement.as_ref())
        .bind(params.medicine.as_deref())
        .bind(params.dosage.as_deref())
        .bind(params.cost.map(|cost| Decimal::new(cost, 2)))
        .bind(params.performed_by.as_deref())
        .bind(params.notes.as_deref())
        .fetch_one(db)
        .await?;

        Ok(record)
    }

    pub async fn find_all<'a, C>(db: C, org_pid: Uuid) -> ModelResult<Vec<Self>>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let records =
            sqlx::query_as::<_, Self>("SELECT * FROM health_records WHERE organisation_pid = $1")
                .bind(org_pid)
                .fetch_all(db)
                .await?;

        Ok(records)
    }

    pub async fn find_by_id<'a, C>(db: C, id: i32, org_pid: Uuid) -> ModelResult<Self>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let record = sqlx::query_as::<_, Self>(
            "SELECT * FROM health_records WHERE id = $1 AND organisation_pid = $2",
        )
        .bind(id)
        .bind(org_pid)
        .fetch_optional(db)
        .await?;

        record.ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn find_by_record_date_range<'e, C>(
        db: C,
        org_pid: Uuid,
        start_date: NaiveDate,
        end_date: NaiveDate,
    ) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>(
                "SELECT * FROM health_records WHERE organisation_pid = $1 AND record_date BETWEEN $2 AND $3"
            )
            .bind(org_pid)
            .bind(start_date)
            .bind(end_date)
            .fetch_all(db)
            .await
            .map_err(Into::into)
    }

    pub async fn find_by_animal<'e, C>(
        db: C,
        animal_pid: Uuid,
        org_pid: Uuid,
    ) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>(
            "
            SELECT * FROM health_records WHERE animal_pid = $1 AND organisation_pid = $2
            ",
        )
        .bind(animal_pid)
        .bind(org_pid)
        .fetch_all(db)
        .await
        .map_err(Into::into)
    }

    pub async fn find_by_record_type<'e, C>(
        db: C,
        record_type: &str,
        org_pid: Uuid,
    ) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>(
            "SELECT * FROM health_records WHERE organisation_pid = $1 AND record_type LIKE $2",
        )
        .bind(org_pid)
        .bind(format!("%{record_type}%"))
        .fetch_all(db)
        .await
        .map_err(Into::into)
    }

    pub async fn find_by_user<'a, C>(db: C, org_pid: Uuid, user_pid: Uuid) -> ModelResult<Vec<Self>>
    where
        C: Executor<'a, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>(
            "SELECT * FROM health_records WHERE organisation_pid = $1 AND created_by = $2",
        )
        .bind(org_pid)
        .bind(user_pid)
        .fetch_all(db)
        .await
        .map_err(Into::into)
    }

    pub async fn delete_by_id<'e, C>(db: C, org_pid: Uuid, id: i32) -> ModelResult<PgQueryResult>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query("DELETE FROM health_records WHERE id = $1 AND organisation_pid = $2")
            .bind(id)
            .bind(org_pid)
            .execute(db)
            .await
            .map_err(Into::into)
    }

    pub async fn seed(db: &sqlx::PgPool, path: &str) -> ModelResult<()> {
        let records = Self::load_file(path).await?;

        Self::seed_data(db, &records).await
    }
}

#[async_trait::async_trait]
impl Seedable for HealthRecord {
    async fn seed_data(db: &sqlx::PgPool, records: &[Self]) -> ModelResult<()> {
        for record in records {
            sqlx::query("
                INSERT INTO health_records (id, animal_pid, organisation_pid, record_type, record_date, description,
                treatment, medicine, dosage, cost, performed_by, notes, created_by, created_at, updated_at) 
                VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15 )
            ")
                .bind(record.id)
                .bind(record.animal_pid)
                .bind(record.organisation_pid)
                .bind(record.record_type.as_str())
                .bind(record.record_date)
                .bind(record.description.as_str())
                .bind(record.treatment.as_deref())
                .bind(record.medicine.as_deref())
                .bind(record.dosage.as_deref())
                .bind(record.cost)
                .bind(record.performed_by.as_deref())
                .bind(record.notes.as_deref())
                .bind(record.created_by)
                .bind(record.created_at)
                .bind(record.updated_at)
                .execute(db)
                .await?;
        }

        Ok(())
    }
}
