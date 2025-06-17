#![allow(clippy::missing_errors_doc)]
#![allow(clippy::needless_raw_string_hashes)]

use chrono::{DateTime, FixedOffset};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, prelude::FromRow};
use uuid::Uuid;

use super::ModelResult;

#[derive(Debug, Deserialize, FromRow, Encode, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LivestockSummary {
    pub pid: Uuid,
    pub organisation_pid: Uuid,
    pub id: i32,
    pub total: i32,
    pub males: i32,
    pub females: i32,
    pub unkown_gender: i32,
    pub active: i32,
    pub transferred: i32,
    pub sold: i32,
    pub deceased: i32,
    pub species: i32,
    pub breeds: i32,
    pub total_purchased_value: Decimal,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Encode, Clone)]
pub struct SummaryData {
    pub total: i64,
    pub males: i64,
    pub females: i64,
    pub unkown_gender: i64,
    pub active: i64,
    pub transferred: i64,
    pub sold: i64,
    pub deceased: i64,
    pub species: i64,
    pub breeds: i64,
    pub total_purchased_value: Decimal,
}

impl SummaryData {
    pub async fn find_by_organisation<'e, C>(db: &C, org_pid: Uuid) -> ModelResult<Option<Self>>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let summary_data = sqlx::query_as::<_, Self>(
            r#"
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE gender = 'male') as males,
                COUNT(*) FILTER (WHERE gender = 'female') as females,
                COUNT(*) FILTER (WHERE gender = 'unkown') as unkown_gender,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'transferred') as transferred,
                COUNT(*) FILTER (WHERE status = 'deceased') as deceased,
                COUNT(*) FILTER (WHERE status = 'sold') as sold,
                COUNT(DISTINCT specie_id) as species,
                COUNT(DISTINCT breed_id) as breeds,
                COALESCE(SUM(purchase_price), 0) as total_purchased_value
            FROM animals
            WHERE organisation_pid = $1
            "#,
        )
        .bind(org_pid)
        .fetch_optional(db)
        .await?;

        Ok(summary_data)
    }
}

impl LivestockSummary {
    pub async fn generate<'e, C>(db: &C, org_pid: Uuid) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let summary_data = SummaryData::find_by_organisation(db, org_pid).await?;

        // Insert the data
        let query = sqlx::query_as::<_, Self>(
            r"
            INSERT INTO livestock_summary (
                organisation_pid,
                total,
                males,
                females,
                unkown_gender,
                active,
                transferred,
                sold,
                deceased,
                species,
                breeds,
                total_purchased_value
            )
            VALUES (
                $1,
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
                $12
            )
            RETURNING *
        ",
        )
        .bind(org_pid)
        .bind(summary_data.as_ref().map_or(0, |data| data.total))
        .bind(summary_data.as_ref().map_or(0, |data| data.males))
        .bind(summary_data.as_ref().map_or(0, |data| data.females))
        .bind(summary_data.as_ref().map_or(0, |data| data.unkown_gender))
        .bind(summary_data.as_ref().map_or(0, |data| data.active))
        .bind(summary_data.as_ref().map_or(0, |data| data.transferred))
        .bind(summary_data.as_ref().map_or(0, |data| data.sold))
        .bind(summary_data.as_ref().map_or(0, |data| data.deceased))
        .bind(summary_data.as_ref().map_or(0, |data| data.species))
        .bind(summary_data.as_ref().map_or(0, |data| data.breeds))
        .bind(
            summary_data
                .as_ref()
                .map_or_else(|| Decimal::new(000, 2), |data| data.total_purchased_value),
        )
        .fetch_one(db)
        .await?;

        Ok(query)
    }
}
