#![allow(clippy::missing_errors_doc)]

use std::borrow::Cow;

use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, PgPool, Postgres, postgres::PgQueryResult, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{ModelError, ModelResult, enums::Subscription};

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RegisterOrg<'a> {
    pub name: Cow<'a, str>,
    pub address: Option<Cow<'a, str>>,
    pub phone: Option<Cow<'a, str>>,
    pub email: Option<Cow<'a, str>>,
    pub subscription_type: Option<Cow<'a, str>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Default, Eq)]
pub struct OrganisationQuery {
    pub subscription: Option<Subscription>,
}

impl OrganisationQuery {
    #[must_use]
    pub const fn new(sub: Subscription) -> Self {
        Self {
            subscription: Some(sub),
        }
    }
}

#[derive(Debug, Deserialize, FromRow, Encode)]
pub struct Organisation {
    pub(crate) id: i32,
    pub(crate) pid: Uuid,
    pub(crate) name: String,
    pub(crate) address: Option<String>,
    pub(crate) phone: Option<String>,
    pub(crate) email: Option<String>,
    pub(crate) subscription_type: Option<Subscription>,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

impl Organisation {
    /// .
    ///
    /// # Errors
    ///
    /// This function will return an error if .
    /// * An [`Organisation`] with the same name already exists
    /// * Any [`sqlx::Error`] occurs.
    pub async fn create<'e, C>(db: C, dto: &RegisterOrg<'_>) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let subscription = dto
            .subscription_type
            .as_ref()
            .map_or_else(|| "basic", |sub| sub.as_ref());

        let query = sqlx::query_as::<_, Self>(
            "
            INSERT INTO organisations (name, address, phone, email, subscription_type )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *   
            ",
        )
        .bind(&dto.name)
        .bind(&dto.address)
        .bind(&dto.phone)
        .bind(&dto.email)
        .bind(Subscription::from(subscription))
        .fetch_one(db)
        .await;

        match query {
            Ok(org) => Ok(org),
            Err(e) => match e {
                sqlx::Error::Database(err) => match err.constraint() {
                    Some("organisations_name_key") => Err(ModelError::EntityAlreadyExists(
                        "Organisation with that name already exists".into(),
                    )),
                    _ => Err(ModelError::from(sqlx::Error::Database(err))),
                },
                _ => Err(ModelError::Sqlx(e)),
            },
        }
    }

    pub async fn read_all<'e, C>(db: C, condition: &OrganisationQuery) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let mut query = sqlx::query_as::<_, Self>("SELECT * FROM organisations");

        if let Some(subscription) = &condition.subscription {
            query = sqlx::query_as::<_, Self>(
                "SELECT * FROM organisations WHERE subscription_type::text LIKE $1",
            )
            .bind(format!("%{subscription}%",));
        }

        let orgs = query.fetch_all(db).await?;

        Ok(orgs)
    }

    pub async fn read_one<'e, C>(db: C, id: i32) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>("SELECT * FROM organisations WHERE id = $1")
            .bind(id)
            .fetch_optional(db)
            .await?
            .ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn delete_by_id<'e, C>(db: C, id: i32) -> ModelResult<PgQueryResult>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query("DELETE FROM organisations WHERE id = $1")
            .bind(id)
            .execute(db)
            .await
            .map_err(Into::into)
    }

    pub async fn seed(db: &PgPool, path: &str) -> ModelResult<()> {
        let orgs = Self::load_file(path).await?;

        Self::seed_data(db, &orgs).await
    }
}

#[async_trait::async_trait]
impl Seedable for Organisation {
    async fn seed_data(db: &sqlx::PgPool, data: &[Self]) -> ModelResult<()> {
        for org in data {
            sqlx::query("
            INSERT INTO organisations (id, pid, name, address, phone, email, subscription_type, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ")
            .bind(org.id)
            .bind(org.pid)
            .bind(org.name.as_str())
            .bind(org.address.as_deref())
            .bind(org.phone.as_deref())
            .bind(org.email.as_deref())
            .bind(org.subscription_type.as_ref())
            .bind(org.created_at)
            .bind(org.updated_at)
            .execute(db)
            .await?;
        }

        Ok(())
    }
}
