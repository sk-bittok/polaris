use serde::{Deserialize, Serialize};
use sqlx::prelude::Type;

use crate::Error;

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord, Clone, Type)]
#[sqlx(type_name = "subscription_type")]
#[sqlx(rename_all = "lowercase")]
pub enum Subscription {
    Basic,
    Business,
    Enterprise,
}

impl std::fmt::Display for Subscription {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let sub = match self {
            Self::Basic => "basic",
            Self::Business => "business",
            Self::Enterprise => "enterprise",
        };
        write!(f, "{sub}")
    }
}

impl From<&str> for Subscription {
    fn from(s: &str) -> Self {
        match s.trim().to_lowercase().as_str() {
            "business" => Self::Business,
            "enterprise" => Self::Enterprise,
            _ => Self::Basic,
        }
    }
}

impl TryFrom<String> for Subscription {
    type Error = Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        match value.to_lowercase().trim() {
            "basic" => Ok(Self::Basic),
            "business" => Ok(Self::Business),
            "enterprise" => Ok(Self::Enterprise),
            _ => Err(Error::InvalidSubscriptionType),
        }
    }
}
