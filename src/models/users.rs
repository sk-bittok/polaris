#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_const_for_fn)]
use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use chrono::{DateTime, FixedOffset, Utc};
use rand::{Rng, distr::Alphanumeric};
use serde::{Deserialize, Serialize};
use sqlx::{Encode, Executor, PgPool, Postgres, prelude::FromRow};
use uuid::Uuid;

use crate::seed::Seedable;

use super::{
    ModelError, ModelResult,
    dto::{CreateNewUser, RegisterAdmin, UpdatePassword},
};

#[derive(Debug, Default, Clone, Deserialize, Serialize)]
pub struct UserQuery {
    pub role: Option<String>,
    pub active: Option<bool>,
}

impl UserQuery {
    #[must_use]
    pub fn new(role: Option<String>, active: Option<bool>) -> Self {
        Self { role, active }
    }
}

#[derive(Debug, Deserialize, FromRow, Encode, Clone)]
pub struct User {
    pub(crate) id: i32,
    pub(crate) pid: Uuid,
    pub(crate) organisation_pid: Uuid,
    pub(crate) role: String,
    pub(crate) email: String,
    pub(crate) password_hash: String,
    pub(crate) first_name: String,
    pub(crate) last_name: String,
    pub(crate) is_active: bool,
    pub(crate) password_change_required: bool,
    pub(crate) reset_token: Option<String>,
    pub(crate) reset_token_sent_at: Option<DateTime<FixedOffset>>,
    pub(crate) last_login: Option<DateTime<FixedOffset>>,
    pub(crate) last_password_change: Option<DateTime<FixedOffset>>,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}

impl User {
    pub async fn read_all<'e, C>(db: C, conditions: &UserQuery) -> ModelResult<Vec<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let mut query = sqlx::query_as::<_, Self>("SELECT * FROM users");

        if let Some(role_id) = &conditions.role {
            query = sqlx::query_as("SELECT * FROM users WHERE role LIKE $1")
                .bind(format!("%{role_id}%",));
        }

        if let Some(is_active) = conditions.active {
            query = sqlx::query_as("SELECT * FROM users WHERE is_active LIKE $1")
                .bind(format!("%{is_active}%",));
        }

        query.fetch_all(db).await.map_err(Into::into)
    }

    pub async fn read_by_id<'e, C>(db: C, id: i32) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        Self::find_by_id(db, id)
            .await?
            .ok_or_else(|| ModelError::EntityNotFound)
    }

    pub async fn create_admin<'e, C>(
        db: C,
        params: &RegisterAdmin<'_>,
        org_pid: Uuid,
    ) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let hashed: String = Self::hash_password(&params.password)?;

        let query = sqlx::query_as::<_, Self>(
            "
            INSERT INTO users (email, first_name, last_name, password_hash, organisation_pid, role, password_change_required)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        ",
        )
        .bind(params.email.trim())
        .bind(params.first_name.trim())
        .bind(params.last_name.trim())
        .bind(hashed)
        .bind(org_pid)
        .bind("admin")
        .bind(false)
        .fetch_one(db)
        .await;

        match query {
            Ok(user) => Ok(user),
            Err(error) => match error {
                sqlx::Error::Database(dberr) => match dberr.constraint() {
                    Some("users_email_key") => Err(ModelError::EntityAlreadyExists(
                        "User with that email address already exist".into(),
                    )),
                    _ => Err(ModelError::Sqlx(sqlx::Error::Database(dberr))),
                },
                _ => Err(ModelError::Sqlx(error)),
            },
        }
    }

    pub async fn find_by_id<'e, C>(db: C, id: i32) -> ModelResult<Option<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(db)
            .await
            .map_err(Into::into)
    }

    fn hash_password(plain_password: &str) -> ModelResult<String> {
        let salt: SaltString = SaltString::generate(&mut OsRng);
        let password_hash: PasswordHash<'_> =
            Argon2::default().hash_password(plain_password.trim().as_bytes(), &salt)?;

        Ok(password_hash.to_string())
    }

    pub async fn find_by_email<'e, C>(db: C, email: &str) -> ModelResult<Option<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(db)
            .await
            .map_err(Into::into)
    }

    pub async fn find_by_pid<'e, C>(db: C, pid: Uuid) -> ModelResult<Option<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        sqlx::query_as::<_, Self>("SELECT * FROM users WHERE pid = $1")
            .bind(pid)
            .fetch_optional(db)
            .await
            .map_err(Into::into)
    }

    pub async fn find_by_claims_key<'e, C>(db: C, key: &str) -> ModelResult<Option<Self>>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let pid = Uuid::parse_str(key)?;

        Self::find_by_pid(db, pid).await
    }

    pub fn validate_password(&self, password: &str) -> ModelResult<bool> {
        let password_hash = PasswordHash::new(&self.password_hash)?;

        let is_valid = Argon2::default()
            .verify_password(password.as_bytes(), &password_hash)
            .is_ok_and(|()| true);

        Ok(is_valid)
    }

    pub async fn record_logout<'e, C>(&self, db: C) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let now = Utc::now().fixed_offset();

        let query = sqlx::query_as::<_, Self>(
            "UPDATE users SET last_login = $2 WHERE pid = $1 RETURNING *",
        )
        .bind(self.pid)
        .bind(now)
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn admin_create_user<'e, C>(
        db: C,
        org_pid: Uuid,
        dto: &CreateNewUser<'_>,
    ) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let temp_password: String = rand::rng()
            .sample_iter(&Alphanumeric)
            .take(12)
            .map(char::from)
            .collect();

        let password = Self::hash_password(&temp_password)?;

        let user = sqlx::query_as::<_, Self>(
            "
            INSERT INTO users 
            (organisation_pid, email, first_name, last_name, role, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ",
        )
        .bind(org_pid)
        .bind(dto.email.trim())
        .bind(dto.first_name.trim())
        .bind(dto.last_name.trim())
        .bind(dto.role.as_ref().trim())
        // User must change his password upon first login.
        .bind(password)
        .fetch_one(db)
        .await?;

        Ok(user)
    }

    pub async fn update_password<'e, C>(&self, db: C, dto: &UpdatePassword<'_>) -> ModelResult<Self>
    where
        C: Executor<'e, Database = Postgres>,
    {
        let password = Self::hash_password(dto.password.trim())?;

        // Update the newly created user's password and unmark the field.
        let query = sqlx::query_as::<_, Self>(
            "
            UPDATE users
            SET password_hash = $2,
            password_change_required = $3
            WHERE pid = $1 RETURNING *",
        )
        .bind(self.pid)
        .bind(password)
        .bind(false)
        .fetch_one(db)
        .await?;

        Ok(query)
    }

    pub async fn seed(db: &PgPool, path: &str) -> ModelResult<()> {
        let users = Self::load_file(path).await?;

        Self::seed_data(db, &users).await
    }
}

#[async_trait::async_trait]
impl Seedable for User {
    async fn seed_data(db: &PgPool, data: &[Self]) -> ModelResult<()> {
        for user in data {
            sqlx::query("
                INSERT INTO users (id, pid, organisation_pid, email, password_hash, first_name, last_name, is_active,
                last_password_change, last_login, role, reset_token, reset_token_sent_at, password_change_required, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                ")
            .bind(user.id)
            .bind(user.pid)
            .bind(user.organisation_pid)
            .bind(user.email.as_str())
            .bind(user.password_hash.as_str())
            .bind(user.first_name.as_str())
            .bind(user.last_name.as_str())
            .bind(user.is_active)
            .bind(user.last_password_change)
            .bind(user.last_login)
            .bind(user.role.as_str())
            .bind(user.reset_token.as_deref())
            .bind(user.reset_token_sent_at)
            .bind(user.password_change_required)
            .bind(user.created_at)
            .bind(user.updated_at)
            .execute(db)
            .await?;
        }

        Ok(())
    }
}
