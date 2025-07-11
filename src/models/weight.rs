#![allow(clippy::missing_errors_doc)]
use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, FromRow, Postgres, postgres::PgQueryResult};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{
    ModelError, ModelResult,
    dto::records::{NewWeightRecord, UpdateWeightRecord},
};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct WeightQuery {
    pub animal: Option<Uuid>,
    pub mass: Option<Decimal>,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Encode, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WeightResponse {
    pub(crate) id: i32,
    pub(crate) organisation_pid: Uuid,
    pub(crate) organisation_name: String,
    pub(crate) animal_pid: Uuid,
    pub(crate) animal_name: String,
    pub(crate) animal_tag_id: String,
    pub(crate) mass: Decimal,
    pub(crate) unit: String,
    pub(crate) previous_mass: Decimal,
    pub(crate) status: String,
    pub(crate) record_date: NaiveDate,
    pub(crate) notes: Option<String>,
    pub(crate) created_by: Uuid,
    pub(crate) created_by_name: String,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Encode, Clone)]
pub struct WeightRecord {
    pub(crate) id: i32,
    pub(crate) organisation_pid: Uuid,
    pub(crate) animal_pid: Uuid,
    pub(crate) mass: Decimal,
    pub(crate) record_date: NaiveDate,
    pub(crate) notes: Option<String>,
    pub(crate) unit: String,
    pub(crate) previous_mass: Decimal,
    pub(crate) status: String,
    pub(crate) created_by: Uuid,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

const FETCH_ALL: &str = "
    SELECT
        a.id,
        a.organisation_pid,
        a.animal_pid,
        a.mass,
        a.record_date,
        a.status,
        a.previous_mass,
        a.unit,
        a.notes,
        a.created_by,
        a.created_at,
        a.updated_at,
        o.name    AS    organisation_name,
        w.name    AS    animal_name,
        b.tag_id  AS    animal_tag_id,
        CONCAT(u.first_name, ' ', u.last_name)    AS created_by_name
    FROM
        weight_records a
    LEFT JOIN
        organisations o ON a.organisation_pid = o.pid
    LEFT JOIN
        animals w ON a.animal_pid = w.pid
    LEFT JOIN
        animals b ON a.animal_pid = b.pid
    LEFT JOIN
        users u ON a.created_by = u.pid
    WHERE
        a.organisation_pid = $1
";

fn fetch_query(conditions: &str) -> String {
    format!("{FETCH_ALL} {conditions}")
}

impl WeightRecord {
    pub async fn find_all<'e, C>(
        db: &C,
        org_pid: Uuid,
        conditions: &WeightQuery,
    ) -> ModelResult<Vec<WeightResponse>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let mut query = sqlx::query_as::<_, WeightResponse>(FETCH_ALL).bind(org_pid);

        if let Some(animal) = conditions.animal {
            query = sqlx::query_as::<_, WeightResponse>(Box::leak(
                fetch_query("AND a.animal_pid = $2").into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(animal);
        }

        if let Some(mass) = conditions.mass {
            query = sqlx::query_as::<_, WeightResponse>(Box::leak(
                fetch_query("AND mass BETWEEN 0 AND $2").into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(mass);
        }

        query.fetch_all(db).await.map_err(Into::into)
    }

    pub async fn find_by_id<'e, C>(db: &C, org_pid: Uuid, id: i32) -> ModelResult<WeightResponse>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let model = sqlx::query_as::<_, WeightResponse>(Box::leak(
            fetch_query("AND a.id = $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(id)
        .fetch_optional(db)
        .await?;

        model.ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn delete_by_id<'e, C>(db: &C, org_pid: Uuid, id: i32) -> ModelResult<PgQueryResult>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let query =
            sqlx::query("DELETE FROM weight_records WHERE id = $1 AND organisation_pid = $2")
                .bind(id)
                .bind(org_pid)
                .execute(db)
                .await?;

        Ok(query)
    }

    pub async fn create<'e, C>(
        db: &C,
        params: &NewWeightRecord<'_>,
        org_pid: Uuid,
        user_pid: Uuid,
    ) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, Self>(
            "
                INSERT INTO weight_records
                (
                    animal_pid,
                    organisation_pid,
                    mass,
                    unit,
                    status,
                    record_date,
                    notes,
                    created_by
                )
                VALUES
                (
                    (SELECT pid FROM animals WHERE tag_id = $1 AND organisation_pid = $2),
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
                RETURNING *
                ",
        )
        .bind(params.tag_id.as_ref())
        .bind(org_pid)
        .bind(Decimal::new(params.mass, 2))
        .bind(params.unit.as_ref())
        .bind(params.status.as_ref().to_lowercase())
        .bind(params.record_date)
        .bind(params.notes.as_ref())
        .bind(user_pid)
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn update_by_id<'e, C>(
        db: &C,
        id: i32,
        org_pid: Uuid,
        params: &UpdateWeightRecord<'_>,
    ) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let model = Self::find_by_id(db, org_pid, id).await?;

        let mass = params.mass.map_or(model.mass, |mass| Decimal::new(mass, 2));
        let previous_mass = params
            .previous_mass
            .map_or(model.mass, |mass| Decimal::new(mass, 2));
        let unit = params.unit.as_ref().map_or(model.unit, ToString::to_string);
        let record_date = params.record_date.map_or(model.record_date, |date| date);
        let notes = params
            .notes
            .as_ref()
            .map_or(model.notes, |notes| Some(notes.to_string()));
        let status = params
            .status
            .as_ref()
            .map_or(model.status, ToString::to_string);

        let updated = sqlx::query_as::<_, Self>(
            "
                UPDATE weight_records
                SET 
                    mass = $3,
                    previous_mass = $4,
                    unit = $5,
                    record_date = $6,
                    status = $7,
                    notes = $8
                WHERE
                    id = $1 AND organisation_pid = $2
                RETURNING *
            ",
        )
        .bind(id)
        .bind(org_pid)
        .bind(mass)
        .bind(previous_mass)
        .bind(unit)
        .bind(record_date)
        .bind(status)
        .bind(notes)
        .fetch_one(db)
        .await?;

        Ok(updated)
    }

    pub async fn seed(db: &sqlx::PgPool, path: &str) -> ModelResult<()> {
        let data = Self::load_file(path).await?;
        Self::seed_data(db, &data).await
    }
}

#[async_trait::async_trait]
impl Seedable for WeightRecord {
    async fn seed_data(db: &sqlx::PgPool, data: &[Self]) -> ModelResult<()> {
        for record in data {
            sqlx::query(
                "
                        INSERT INTO weight_records
                            (
                                id,
                                animal_pid,
                                organisation_pid,
                                mass,
                                unit,
                                status,
                                previous_mass,
                                record_date,
                                notes,
                                created_by,
                                created_at,
                                updated_at
                                
                            )
                        VALUES
                            (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12      
                            )
            ",
            )
            .bind(record.id)
            .bind(record.animal_pid)
            .bind(record.organisation_pid)
            .bind(record.mass)
            .bind(record.unit.as_str())
            .bind(record.status.as_str())
            .bind(record.previous_mass)
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
