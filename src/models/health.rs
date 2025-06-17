#![allow(clippy::missing_errors_doc)]

use std::{borrow::Cow, str::FromStr};

use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{
    ModelError, ModelResult,
    dto::records::{NewHealthRecord, UpdateHealthRecord},
};

#[derive(Debug, Deserialize, Serialize)]
pub struct HealthRecordsQuery<'a> {
    pub animal: Option<Uuid>,
    pub record_type: Option<Cow<'a, str>>,
}

impl<'a> HealthRecordsQuery<'a> {
    #[must_use]
    pub fn new(animal: Option<Uuid>, record_type: Option<&'a str>) -> Self {
        Self {
            animal,
            record_type: record_type.map(Cow::Borrowed),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, FromRow, Encode)]
#[serde(rename_all = "camelCase")]
pub struct HealthRecordResponse {
    pub id: i32,
    pub animal_pid: Uuid,
    pub animal_name: String,
    pub animal_tag_id: String,
    pub organisation_pid: Uuid,
    pub organisation_name: String,
    pub condition: String,
    pub severity: String,
    pub status: String,
    pub record_date: NaiveDate,
    pub description: String,
    pub treatment: Option<String>,
    pub medicine: Option<String>,
    pub dosage: Option<String>,
    pub cost: Option<Decimal>,
    pub performed_by: Option<String>,
    pub notes: Option<String>,
    pub created_by: Uuid,
    pub prognosis: Option<String>,
    pub created_by_name: String,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Encode)]
pub struct HealthRecord {
    pub(crate) id: i32,
    pub(crate) animal_pid: Uuid,
    pub(crate) organisation_pid: Uuid,
    pub(crate) condition: String,
    pub(crate) status: String,
    pub(crate) severity: String,
    pub(crate) record_date: NaiveDate,
    pub(crate) description: String,
    pub(crate) treatment: Option<String>,
    pub(crate) medicine: Option<String>,
    pub(crate) dosage: Option<String>,
    pub(crate) cost: Option<Decimal>,
    pub(crate) performed_by: Option<String>,
    pub(crate) prognosis: Option<String>,
    pub(crate) notes: Option<String>,
    pub(crate) created_by: Uuid,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

const FETCH_QUERY: &str = "
    SELECT
        hr.id,
        hr.animal_pid,
        hr.organisation_pid,
        hr.notes,
        hr.condition,
        hr.status,
        hr.severity,
        hr.prognosis,
        hr.record_date,
        hr.description,
        hr.medicine,
        hr.dosage,
        hr.cost,
        hr.treatment,
        hr.performed_by,
        hr.created_by,
        hr.created_at,
        hr.updated_at,
        o.name    AS    organisation_name,
        a.name    AS    animal_name,
        b.tag_id  AS    animal_tag_id,
        CONCAT(u.first_name, ' ', u.last_name)    AS created_by_name
    FROM
        health_records hr
    LEFT JOIN
        organisations o ON hr.organisation_pid = o.pid
    LEFT JOIN
        animals a ON hr.animal_pid = a.pid
    LEFT JOIN
        animals b ON hr.animal_pid = b.pid
    LEFT JOIN
        users u ON hr.created_by = u.pid
    WHERE
        hr.organisation_pid = $1
";

fn fetch_query(conditions: &str) -> String {
    format!("{FETCH_QUERY} {conditions}")
}

impl HealthRecord {
    pub async fn create<'a, C>(
        db: C,
        params: &NewHealthRecord<'_>,
        org_pid: Uuid,
        user_pid: Uuid,
    ) -> ModelResult<Self>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let record_date = NaiveDate::from_str(&params.record_date)?;

        let record = sqlx::query_as::<_, Self>(
            "INSERT INTO health_records (
                    animal_pid,
                    organisation_pid,
                    created_by,
                    condition,
                    status,
                    severity,
                    record_date,
                    description,
                    treatment,
                    medicine,
                    dosage,
                    cost,
                    performed_by,
                    notes
            )
            VALUES (
                    (SELECT pid FROM animals WHERE tag_id = $1 AND organisation_pid = $2),
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13,
                    $14
            )
            RETURNING * ",
        )
        .bind(params.tag_id.as_ref().to_uppercase())
        .bind(org_pid)
        .bind(user_pid)
        .bind(params.condition.as_ref().to_lowercase())
        .bind(params.status.as_ref().to_lowercase())
        .bind(params.severity.as_ref().to_lowercase())
        .bind(record_date)
        .bind(params.description.as_ref())
        .bind(params.treatment.as_ref())
        .bind(params.medicine.as_deref())
        .bind(params.dosage.as_deref())
        .bind(params.cost.map(|cost| Decimal::new(cost, 2)))
        .bind(params.performed_by.as_deref())
        .bind(params.notes.as_deref())
        .fetch_one(db)
        .await?;

        Ok(record)
    }

    pub async fn find_all<'a, C>(
        db: C,
        org_pid: Uuid,
        conditions: &HealthRecordsQuery<'_>,
    ) -> ModelResult<Vec<HealthRecordResponse>>
    where
        C: Executor<'a, Database = Postgres>,
    {
        let mut records = sqlx::query_as::<_, HealthRecordResponse>(FETCH_QUERY).bind(org_pid);

        if let Some(animal) = conditions.animal {
            records = sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
                fetch_query("AND hr.animal_pid = $2").into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(animal);
        }

        if let Some(record_type) = &conditions.record_type {
            records = sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
                fetch_query("AND condition ILIKE $2").into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(format!("%{record_type}%"));
        }

        records.fetch_all(db).await.map_err(Into::into)
    }

    pub async fn find_by_id<'e, C>(
        db: &C,
        id: i32,
        org_pid: Uuid,
    ) -> ModelResult<HealthRecordResponse>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let record = sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
            fetch_query("AND hr.id = $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(id)
        .fetch_optional(db)
        .await?;

        record.ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn find_recent_activities<'e, C>(
        db: &C,
        org_pid: Uuid,
    ) -> ModelResult<Vec<HealthRecordResponse>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
            fetch_query("ORDER BY hr.created_at DESC LIMIT 20").into_boxed_str(),
        ))
        .bind(org_pid)
        .fetch_all(db)
        .await?;

        Ok(query)
    }

    pub async fn find_by_record_date_range<'e, C>(
        db: C,
        org_pid: Uuid,
        start_date: NaiveDate,
        end_date: NaiveDate,
    ) -> ModelResult<Vec<HealthRecordResponse>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
            fetch_query("AND record_date BETWEEN $2 AND $3").into_boxed_str(),
        ))
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
    ) -> ModelResult<Vec<HealthRecordResponse>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
            fetch_query("AND hr.animal_pid = $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(animal_pid)
        .fetch_all(db)
        .await
        .map_err(Into::into)
    }

    pub async fn find_by_condition<'e, C>(
        db: C,
        condition: &str,
        org_pid: Uuid,
    ) -> ModelResult<Vec<HealthRecordResponse>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
            fetch_query(" AND hr.condition LIKE $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(format!("%{condition}%"))
        .fetch_all(db)
        .await
        .map_err(Into::into)
    }

    pub async fn find_by_user<'a, C>(
        db: C,
        org_pid: Uuid,
        user_pid: Uuid,
    ) -> ModelResult<Vec<HealthRecordResponse>>
    where
        C: Executor<'a, Database = Postgres>,
    {
        sqlx::query_as::<_, HealthRecordResponse>(Box::leak(
            fetch_query("AND hr.created_by = $2").into_boxed_str(),
        ))
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

    pub async fn update_by_id<'e, C>(
        db: &C,
        id: i32,
        org_pid: Uuid,
        params: &UpdateHealthRecord<'_>,
    ) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let model = Self::find_by_id(db, id, org_pid).await?;
        // Set values to be updated
        let condition = params
            .condition
            .as_ref()
            .map_or(model.condition, ToString::to_string);
        let status = params
            .status
            .as_ref()
            .map_or(model.status, ToString::to_string);
        let severity = params
            .severity
            .as_ref()
            .map_or(model.severity, ToString::to_string);
        let notes = params
            .notes
            .as_ref()
            .map_or(model.notes, |notes| Some(notes.to_string()));
        let cost = params
            .cost
            .map_or(model.cost, |cost| Some(Decimal::new(cost, 2)));
        let medicine = params
            .medicine
            .as_ref()
            .map_or(model.medicine, |drug| Some(drug.to_string()));
        let performed_by = params
            .performed_by
            .as_ref()
            .map_or(model.performed_by, |vet| Some(vet.to_string()));
        let record_date = params.record_date.map_or(model.record_date, |date| date);
        let description = params
            .description
            .as_ref()
            .map_or(model.description, ToString::to_string);
        let treatment = params
            .treatment
            .as_ref()
            .map_or(model.treatment, |t| Some(t.to_string()));
        let dosage = params
            .dosage
            .as_ref()
            .map_or(model.dosage, |d| Some(d.to_string()));
        let prognosis = params
            .prognosis
            .as_ref()
            .map_or(model.prognosis, |p| Some(p.to_string()));

        let updated = sqlx::query_as::<_, Self>(
            "
                    UPDATE health_records
                        SET
                            condition = $3,
                            status = $4,
                            severity = $5,
                            treatment = $6,
                            dosage = $7,
                            medicine = $8,
                            notes = $9,
                            description = $10,
                            performed_by = $11,
                            record_date = $12,
                            prognosis = $13,
                            cost = $14
                    WHERE
                        id = $1 AND organisation_pid = $2
                    RETURNING *
                ",
        )
        .bind(id)
        .bind(org_pid)
        .bind(condition)
        .bind(status)
        .bind(severity)
        .bind(treatment)
        .bind(dosage)
        .bind(medicine)
        .bind(notes)
        .bind(description)
        .bind(performed_by)
        .bind(record_date)
        .bind(prognosis)
        .bind(cost)
        .fetch_one(db)
        .await?;

        Ok(updated)
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
            sqlx::query(
                "
                INSERT INTO health_records (
                                id,
                                animal_pid,
                                organisation_pid,
                                condition,
                                severity,
                                status,
                                record_date,
                                description,
                                treatment,
                                medicine,
                                dosage,
                                cost,
                                performed_by,
                                prognosis,
                                notes,
                                created_by,
                                created_at,
                                updated_at
                ) 
                VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18 )
            ",
            )
            .bind(record.id)
            .bind(record.animal_pid)
            .bind(record.organisation_pid)
            .bind(record.condition.as_str())
            .bind(record.severity.as_str())
            .bind(record.status.as_str())
            .bind(record.record_date)
            .bind(record.description.as_str())
            .bind(record.treatment.as_deref())
            .bind(record.medicine.as_deref())
            .bind(record.dosage.as_deref())
            .bind(record.cost)
            .bind(record.performed_by.as_deref())
            .bind(record.prognosis.as_deref())
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
