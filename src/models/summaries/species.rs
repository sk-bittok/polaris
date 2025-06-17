#![allow(clippy::missing_errors_doc)]
#![allow(clippy::needless_raw_string_hashes)]

use chrono::{DateTime, FixedOffset};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, prelude::FromRow};
use uuid::Uuid;

use crate::models::ModelResult;

#[derive(Debug, Deserialize, Serialize, Encode, FromRow, Clone)]
pub struct SpecieSummary {
    pub specie_name: String,
    pub pid: Uuid,
    pub organisation_pid: Uuid,
    pub id: i32,
    pub specie_id: i32,
    pub total: i32,
    pub males: i32,
    pub females: i32,
    pub unknown_gender: i32,
    pub active: i32,
    pub transferred: i32,
    pub sold: i32,
    pub deceased: i32,
    pub average_age_months: Option<Decimal>,
    pub average_weight_male: Option<Decimal>,
    pub average_weight_female: Option<Decimal>,
    pub total_purchase_value: Decimal,
    pub last_calculated_at: DateTime<FixedOffset>,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

impl SpecieSummary {
    pub async fn generate<'e, C>(db: &C, org_pid: Uuid, specie: &str) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let data = SpecieSummaryExtract::get_from_animals(db, org_pid, specie).await?;

        let query = sqlx::query_as::<_, Self>(
            r#"
            INSERT INTO species_summary (
                organisation_pid,
                specie_name,
                specie_id,
                total,
                males,
                females,
                unknown_gender,
                active,
                transferred,
                sold,
                deceased,
                average_age_months,
                average_weight_male,
                average_weight_female,
                total_purchase_value
            )
            VALUES (
                $1,
                (SELECT name FROM species s WHERE s.name ILIKE $2),
                (SELECT id FROM species s WHERE s.name ILIKE $2),
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
                $14,
                $15
            )
            RETURNING *
        "#,
        )
        .bind(org_pid)
        .bind(specie)
        .bind(specie)
        .bind(data.as_ref().map_or(0, |data| data.total))
        .bind(data.as_ref().map_or(0, |data| data.males))
        .bind(data.as_ref().map_or(0, |data| data.females))
        .bind(data.as_ref().map_or(0, |data| data.unkown_gender))
        .bind(data.as_ref().map_or(0, |data| data.active))
        .bind(data.as_ref().map_or(0, |data| data.transferred))
        .bind(data.as_ref().map_or(0, |data| data.sold))
        .bind(data.as_ref().map_or(0, |data| data.deceased))
        .bind(data.as_ref().map(|data| data.average_age_months))
        .bind(data.as_ref().map(|data| data.average_weight_male))
        .bind(data.as_ref().map(|data| data.average_weight_female))
        .bind(
            data.as_ref()
                .map_or_else(|| Decimal::new(000, 2), |data| data.total_purchase_value),
        )
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn find_all<'e, C>(db: &C, org_pid: Uuid, specie: &str) -> ModelResult<Vec<Self>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let reports = sqlx::query_as::<_, Self>(
            r#"
            select * from species_summary where organisation_pid = $1 and specie_name ilike $2
        "#,
        )
        .bind(org_pid)
        .bind(specie)
        .fetch_all(db)
        .await?;

        Ok(reports)
    }
}

#[derive(Debug, Deserialize, Serialize, Encode, FromRow, Clone)]
pub struct SpecieSummaryExtract {
    pub total: i64,
    pub males: i64,
    pub females: i64,
    pub unkown_gender: i64,
    pub active: i64,
    pub transferred: i64,
    pub sold: i64,
    pub deceased: i64,
    pub average_age_months: Option<Decimal>,
    pub average_weight_male: Option<Decimal>,
    pub average_weight_female: Option<Decimal>,
    pub total_purchase_value: Decimal,
}

impl SpecieSummaryExtract {
    pub async fn get_from_animals<'e, C>(
        db: &C,
        org_pid: Uuid,
        specie: &str,
    ) -> ModelResult<Option<Self>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>(
            r#"
            SELECT
                COUNT(*)                                                AS      total,
                COUNT(*)    FILTER (WHERE gender = 'male')              AS      males,
                COUNT(*)    FILTER (WHERE gender = 'female')            AS      females,
                COUNT(*)    FILTER (WHERE gender = 'unkown')            AS      unkown_gender,
                COUNT(*)    FILTER (WHERE status = 'active')            AS      active,
                COUNT(*)    FILTER (WHERE status = 'sold')              AS      sold,
                COUNT(*)    FILTER (WHERE status = 'transferred')       AS      transferred,
                COUNT(*)    FILTER (WHERE status = 'deceased')          AS      deceased,
                COALESCE(SUM(purchase_price), 0)                        AS      total_purchase_value,
                AVG(current_weight) FILTER(WHERE gender = 'male')       AS      average_weight_male,
                AVG(current_weight) FILTER(WHERE gender = 'female')     AS      average_weight_female,
                AVG(
                EXTRACT(YEAR FROM   AGE(CURRENT_DATE, date_of_birth)) * 12 +
                EXTRACT(MONTH FROM  AGE(CURRENT_DATE, date_of_birth))
                )                                                       AS      average_age_months
            FROM animals
            WHERE organisation_pid = $1 and specie_id = (SELECT id FROM species WHERE name = $2)
        "#,
        )
            .bind(org_pid)
            .bind(specie)
            .fetch_optional(db)
            .await
            .map_err(Into::into)
    }
}
