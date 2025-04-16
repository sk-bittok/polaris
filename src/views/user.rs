use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::users::User;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentUser {
    pub(crate) id: i32,
    pub(crate) organisation_pid: Uuid,
    pub(crate) role: String,
    pub(crate) email: String,
    pub(crate) first_name: String,
    pub(crate) last_name: String,
    pub(crate) created_at: String,
    pub(crate) updated_at: String,
    pub(crate) last_login: Option<String>,
}

impl CurrentUser {
    #[must_use]
    pub fn new(user: &User) -> Self {
        Self {
            id: user.id,
            organisation_pid: user.organisation_pid,
            role: user.role.to_string(),
            email: user.email.to_string(),
            first_name: user.first_name.to_string(),
            last_name: user.last_name.to_string(),
            created_at: user.created_at.format("%d-%m-%Y %H:%M").to_string(),
            updated_at: user.updated_at.format("%d-%m-%Y %H:%M").to_string(),
            last_login: user
                .last_login
                .map(|date: DateTime<FixedOffset>| date.format("%d-%m-%Y %H:%M:%S").to_string()),
        }
    }
}
