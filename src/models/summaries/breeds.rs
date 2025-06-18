#![allow(clippy::missing_errors_doc)]
#![allow(clippy::needless_raw_string_hashes)]

use chrono::{DateTime, FixedOffset};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, prelude::FromRow};
use uuid::Uuid;

use crate::models::ModelResult;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BreedSummaryQuery {
    pub specie: Option<String>,
    pub breed: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Encode, FromRow)]
pub struct BreedSummary {
    pub specie_name: String,
    pub breed_name: String,
    pub pid: Uuid,
    pub organisation_pid: Uuid,
    pub id: i32,
    pub specie_id: i32,
    pub breed_id: i32,
    pub total: i32,
    pub males: i32,
    pub females: i32,
    pub unknown_gender: i32,
    pub active: i32,
    pub transferred: i32,
    pub sold: i32,
    pub deceased: i32,
    pub average_age_months: Option<Decimal>,
    pub average_birth_weight_male: Option<Decimal>,
    pub average_birth_weight_female: Option<Decimal>,
    pub average_weight_male: Option<Decimal>,
    pub average_weight_female: Option<Decimal>,
    pub total_purchase_value: Decimal,
    pub average_purchase_price: Decimal,
    pub youngest_age_months: Option<i32>,
    pub oldest_age_months: Option<i32>,
    pub last_calculated_at: DateTime<FixedOffset>,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

impl BreedSummary {
    pub async fn generate<'e, C>(
        db: &C,
        org_pid: Uuid,
        breed: &str,
        specie: &str,
    ) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let data = BreedSummaryExtract::get_from_animals(db, org_pid, breed, specie).await?;

        let query = sqlx::query_as::<_, Self>(
            r#"
            INSERT INTO breed_summary (
                organisation_pid,
                specie_name,
                specie_id,
                breed_name,
                breed_id,
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
                average_birth_weight_male,
                average_birth_weight_female,
                total_purchase_value,
                average_purchase_price,
                youngest_age_months,
                oldest_age_months
            )
            VALUES (
                $1,
                (SELECT name FROM species s WHERE s.name ILIKE $2),
                (SELECT id FROM species s WHERE s.name ILIKE $2),
                (SELECT name FROM breeds b WHERE b.name ILIKE $3),
                (SELECT id FROM breeds b WHERE b.name ILIKE $3),
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
                $15,
                $16,
                $17,
                $18,
                $19,
                $20
            )
            RETURNING *
        "#,
        )
        .bind(org_pid)
        .bind(specie)
        .bind(breed)
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
        .bind(data.as_ref().map(|data| data.average_birth_weight_male))
        .bind(data.as_ref().map(|data| data.average_birth_weight_female))
        .bind(
            data.as_ref()
                .map_or_else(|| Decimal::new(000, 2), |data| data.total_purchase_value),
        )
        .bind(data.as_ref().map(|data| data.average_purchase_price))
        .bind(data.as_ref().map(|data| data.youngest_age_months))
        .bind(data.as_ref().map(|data| data.oldest_age_months))
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn find_list<'e, C>(
        db: &C,
        org_pid: Uuid,
        params: &BreedSummaryQuery,
    ) -> ModelResult<Vec<Self>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let query = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM breed_summary bs
            WHERE bs.organisation_pid = $1
                AND ($2 IS NULL OR bs.specie_id = (
                    SELECT id FROM species WHERE name ILIKE $2
                    )
                )
                AND ($3 IS NULL OR bs.breed_id = (
                    SELECT id FROM breeds WHERE name ILIKE $3
                    )
                )
        "#,
        )
        .bind(org_pid)
        .bind(&params.specie)
        .bind(&params.breed)
        .fetch_all(db)
        .await?;

        Ok(query)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Encode, FromRow)]
pub struct BreedSummaryExtract {
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
    pub average_birth_weight_male: Option<Decimal>,
    pub average_birth_weight_female: Option<Decimal>,
    pub average_purchase_price: Option<Decimal>,
    pub youngest_age_months: Option<Decimal>,
    pub oldest_age_months: Option<Decimal>,
}

impl BreedSummaryExtract {
    pub async fn get_from_animals<'e, C>(
        db: &C,
        org_pid: Uuid,
        breed: &str,
        specie: &str,
    ) -> ModelResult<Option<Self>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let data = sqlx::query_as::<_, Self>(
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
                AVG(purchase_price)                                     AS      average_purchase_price,
                AVG(current_weight) FILTER (WHERE gender = 'male')      AS      average_weight_male,
                AVG(current_weight) FILTER (WHERE gender = 'female')    AS      average_weight_female,
                AVG(weight_at_birth) FILTER (WHERE gender = 'male')     AS      average_birth_weight_male,
                AVG(weight_at_birth) FILTER (WHERE gender = 'female')   AS      average_birth_weight_female,
                MIN(
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) * 12 +
                EXTRACT(MONTH FROM AGE(CURRENT_DATE, date_of_birth))
                )                                                       AS      youngest_age_months,
                MAX(
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) * 12 +
                EXTRACT(MONTH FROM AGE(CURRENT_DATE, date_of_birth))
                )                                                       AS      oldest_age_months,
                AVG(
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) * 12 +
                EXTRACT(MONTH FROM AGE(CURRENT_DATE, date_of_birth))
                )                                                       AS      average_age_months
            FROM animals
            WHERE
                organisation_pid = $1
            AND
                breed_id = (SELECT id FROM breeds b WHERE b.name ILIKE $2)
            AND
                specie_id = (SELECT id FROM species s WHERE s.name ILIKE $3)
        "#,
        )
            .bind(org_pid)
            .bind(breed)
            .bind(specie)
            .fetch_optional(db)
        .await?;

        Ok(data)
    }
}
