use serde::{Deserialize, Serialize};
use sqlx::prelude::Type;

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
