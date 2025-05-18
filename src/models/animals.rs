#![allow(clippy::missing_errors_doc)]
#![allow(clippy::too_many_lines)]

use async_trait::async_trait;
use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{
    ModelError, ModelResult,
    dto::{RegisterAnimal, UpdateAnimal},
};

#[derive(Debug, Deserialize, Serialize, Encode, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct AnimalCleaned {
    pub(crate) id: i32,
    pub(crate) pid: Uuid,
    pub(crate) organisation_pid: Uuid,
    pub(crate) organisation_name: String,
    pub(crate) tag_id: String,
    pub(crate) name: String,
    pub(crate) specie_name: String,
    pub(crate) breed_name: String,
    pub(crate) date_of_birth: Option<NaiveDate>,
    pub(crate) gender: String,
    pub(crate) parent_female_name: Option<String>,
    pub(crate) parent_female_tag_id: Option<String>,
    pub(crate) parent_female_id: Option<Uuid>,
    pub(crate) parent_male_name: Option<String>,
    pub(crate) parent_male_tag_id: Option<String>,
    pub(crate) parent_male_id: Option<Uuid>,
    pub(crate) status: String,
    pub(crate) purchase_date: Option<NaiveDate>,
    pub(crate) purchase_price: Option<Decimal>,
    pub(crate) weight_at_birth: Option<Decimal>,
    pub(crate) current_weight: Option<Decimal>,
    pub(crate) notes: Option<String>,
    pub(crate) created_by: Uuid,
    pub(crate) created_by_name: String,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AnimalQuery {
    pub specie: Option<String>,
    pub breed: Option<String>,
    pub purchase_date: Option<NaiveDate>,
}

#[derive(Debug, Deserialize, FromRow, Encode, Serialize)]
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

const SELECT_QUERY: &str = "
            SELECT 
                a.id,
                a.pid,
                a.organisation_pid,
                o.name AS organisation_name,
                a.tag_id,
                a.name,
                b.name  AS  breed_name,
                s.name  AS  specie_name,
                a.gender,
                a.date_of_birth,
                a.current_weight,
                a.weight_at_birth,
                a.parent_female_id,
                f.tag_id  AS  parent_female_tag_id,
                g.name AS parent_female_name,
                a.parent_male_id,
                m.tag_id  AS  parent_male_tag_id,
                n.name AS parent_male_name,
                a.status,
                a.created_at,
                a.updated_at,
                a.purchase_date,
                a.purchase_price,
                a.notes,
                a.created_by,
                CONCAT(u.first_name, ' ', u.last_name) AS created_by_name
            FROM
                animals a
            LEFT JOIN
                organisations o ON a.organisation_pid = o.pid
            LEFT JOIN
                breeds b ON a.breed_id = b.id
            LEFT JOIN
                species s ON a.specie_id = s.id
            LEFT JOIN
                animals f ON a.parent_female_id = f.pid
            LEFT JOIN
                animals g ON a.parent_female_id = g.pid
            LEFT JOIN
                animals m ON a.parent_male_id = m.pid
            LEFT JOIN
                animals n ON a.parent_male_id = n.pid
            LEFT JOIN
                users u ON a.created_by = u.pid
            WHERE a.organisation_pid = $1
            ";

fn select_query(conditions: &str) -> String {
    format!("{SELECT_QUERY} {conditions}")
}

impl Animal {
    pub async fn find_all<'e, C>(
        db: C,
        org_pid: Uuid,
        conditions: &AnimalQuery,
    ) -> ModelResult<Vec<AnimalCleaned>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let mut query = sqlx::query_as::<_, AnimalCleaned>(Box::leak(
            select_query("ORDER BY a.created_at DESC").into_boxed_str(),
        ))
        .bind(org_pid);

        if let Some(specie) = &conditions.specie {
            query = sqlx::query_as::<_, AnimalCleaned>(Box::leak(
                select_query("AND s.name ILIKE $2\nORDER BY a.created_at DESC").into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(format!("%{}%", specie.as_str()));
        }

        if let Some(breed) = &conditions.breed {
            query = sqlx::query_as::<_, AnimalCleaned>(Box::leak(
                select_query("AND b.name ILIKE $2\nORDER BY a.created_at DESC").into_boxed_str(),
            ))
            .bind(org_pid)
            .bind(format!("%{}%", breed.as_str()));
        }

        query.fetch_all(db).await.map_err(Into::into)
    }

    pub async fn find_by_id<'e, C>(db: C, org_pid: Uuid, id: Uuid) -> ModelResult<AnimalCleaned>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, AnimalCleaned>(Box::leak(
            select_query("AND a.pid = $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(id)
        .fetch_optional(db)
        .await?
        .ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn find_by_tag_id<'e, C>(
        db: &C,
        org_pid: Uuid,
        tag_id: &str,
    ) -> ModelResult<AnimalCleaned>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let item = sqlx::query_as::<_, AnimalCleaned>(Box::leak(
            select_query("AND a.tag_id = $2").into_boxed_str(),
        ))
        .bind(org_pid)
        .bind(tag_id.trim())
        .fetch_optional(db)
        .await?;

        item.ok_or_else(|| ModelError::EntityNotFound)
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
        let birth_date = params
            .date_of_birth
            .as_ref()
            .map(|date| {
                let dob = date.split('T').collect::<Vec<_>>();
                Ok::<_, ModelError>(NaiveDate::parse_from_str(dob[0], "%Y-%m-%d")?)
            })
            .transpose()?;
        let purchase_date = params
            .purchase_date
            .as_ref()
            .map(|date| {
                let pd = date.split('T').collect::<Vec<_>>();
                Ok::<_, ModelError>(NaiveDate::parse_from_str(pd[0], "%Y-%m-%d")?)
            })
            .transpose()?;

        let query = sqlx::query_as::<_, Self>(
            "
            INSERT INTO animals
            (
                organisation_pid,
                tag_id,
                breed_id,
                specie_id,
                name,
                gender,
                date_of_birth,
                status,
                parent_female_id,
                parent_male_id,
                purchase_date,
                purchase_price,
                weight_at_birth,
                current_weight,
                notes,
                created_by
            )
            VALUES 
            (
                $1,
                $2,
                (SELECT id FROM breeds b WHERE b.name ILIKE $3 AND (b.is_system_defined = TRUE OR b.organisation_pid = $1)),
                (SELECT id FROM species s WHERE s.name LIKE $4),
                $5,
                $6,
                $7,
                $8,
                CASE
                    WHEN $9 IS NOT NULL THEN (SELECT pid FROM animals WHERE tag_id = $9 AND organisation_pid = $1)
                    ELSE NULL
                END,
                CASE
                    WHEN $10 IS NOT NULL THEN (SELECT pid FROM animals WHERE tag_id = $10 AND organisation_pid = $1)
                    ELSE NULL
                END,
                $11,
                $12,
                $13,
                $14,
                $15,
                $16
            )
            RETURNING *
            ",
        )
        .bind(org_pid)
        .bind(params.tag_id.as_ref())
        .bind(format!("%{}%", params.breed.as_ref()))
        .bind(format!("%{}%" ,params.specie.as_ref()))
        .bind(params.name.as_ref())
        .bind(params.gender.to_string())
        .bind(birth_date)
        .bind(params.status.as_ref())
        .bind(params.female_parent_id.as_ref())
        .bind(params.male_parent_id.as_ref())
        .bind(purchase_date)
        .bind(purchase_price)
        .bind(birth_weight)
        .bind(current_weight)
        .bind(params.notes.as_deref())
        .bind(user_pid)
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn update_by_id<'e, C>(
        db: &C,
        params: &UpdateAnimal<'_>,
        org_pid: Uuid,
        id: Uuid,
    ) -> ModelResult<Self>
    where
        for<'a> &'a C: Executor<'e, Database = Postgres>,
    {
        let item = Self::find_by_id(db, org_pid, id).await?;

        let tag_id = params
            .tag_id
            .as_ref()
            .map_or(item.tag_id.to_string(), ToString::to_string);
        let name = params
            .name
            .as_ref()
            .map_or(item.name.to_string(), ToString::to_string);
        let breed_name = params
            .breed
            .as_ref()
            .map_or(item.breed_name.to_string(), ToString::to_string);
        let specie_name = params
            .specie
            .as_ref()
            .map_or(item.specie_name.to_string(), ToString::to_string);
        let notes = params
            .notes
            .as_ref()
            .map_or(item.notes.clone(), |notes| Some(notes.to_string()));
        let gender = params
            .gender
            .as_ref()
            .map_or(item.gender.to_string(), ToString::to_string);
        let status = params
            .status
            .as_ref()
            .map_or(item.status.to_string(), ToString::to_string);
        let parent_female_tag_id = params
            .female_parent_id
            .as_ref()
            .map_or(item.parent_female_tag_id.clone(), |id| Some(id.to_string()));
        let parent_male_tag_id = params
            .male_parent_id
            .as_ref()
            .map_or(item.parent_male_tag_id.clone(), |id| Some(id.to_string()));
        let current_weight = params
            .current_weight
            .map_or(item.current_weight, |mass| Some(Decimal::new(mass, 2)));
        let weight_at_birth = params
            .weight_at_birth
            .map_or(item.weight_at_birth, |mass| Some(Decimal::new(mass, 2)));
        let purchase_price = params
            .purchase_price
            .map_or(item.purchase_price, |price| Some(Decimal::new(price, 2)));
        let date_of_birth =
            params
                .date_of_birth
                .as_ref()
                .map_or(Ok(item.date_of_birth), |date| {
                    let date = date.split('T').collect::<Vec<_>>();
                    Ok::<_, ModelError>(Some(NaiveDate::parse_from_str(date[0], "%Y-%m-%d")?))
                })?;
        let purchase_date =
            params
                .purchase_date
                .as_ref()
                .map_or(Ok(item.purchase_date), |date| {
                    let date = date.split('T').collect::<Vec<_>>();
                    Ok::<_, ModelError>(Some(NaiveDate::parse_from_str(date[0], "%Y-%m-%d")?))
                })?;

        let query = sqlx::query_as::<_, Self>(
            "
            UPDATE animals
            SET
                tag_id = $3,
                breed_id = (SELECT id FROM breeds b WHERE b.name ILIKE $4 AND (b.is_system_defined = true OR organisation_pid = $2 )),
                specie_id = (SELECT id FROM species s WHERE s.name ILIKE $5),
                name = $6,
                gender = $7,
                date_of_birth = $8,
                status = $9,
                parent_female_id =
                    CASE
                        WHEN $10 IS NOT NULL THEN (SELECT pid FROM animals WHERE tag_id = $10 AND organisation_pid = $2)
                        ELSE NULL
                    END,
                parent_male_id = 
                    CASE
                        WHEN $11 IS NOT NULL THEN (SELECT pid FROM animals WHERE tag_id = $11 AND organisation_pid = $2)
                        ELSE NULL
                    END,
                purchase_date = $12,
                purchase_price = $13,
                weight_at_birth = $14,
                current_weight = $15,
                notes = $16
            WHERE pid = $1 AND organisation_pid = $2
            RETURNING *
            ",
        )
        .bind(id)
        .bind(org_pid)
        .bind(tag_id)
        .bind(format!("%{breed_name}%"))
        .bind(format!("%{specie_name}%"))
        .bind(name)
        .bind(gender)
        .bind(date_of_birth)
        .bind(status)
        .bind(parent_female_tag_id)
        .bind(parent_male_tag_id)
        .bind(purchase_date)
        .bind(purchase_price)
        .bind(weight_at_birth)
        .bind(current_weight)
        .bind(notes)
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn seed(db: &sqlx::PgPool, path: &str) -> ModelResult<()> {
        let animals = Self::load_file(path).await?;

        Self::seed_data(db, &animals).await
    }

    pub async fn delete_by_id<'e, C>(db: C, org_id: Uuid, id: Uuid) -> ModelResult<PgQueryResult>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query("DELETE FROM animals WHERE pid = $1 AND organisation_pid = $2")
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
