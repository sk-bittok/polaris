use std::fmt::{self, Display, Formatter};

#[derive(Debug, Default, Clone, PartialEq, PartialOrd, Eq)]
pub enum Environment {
    #[default]
    Development,
    Production,
    Testing,
    Other(String),
}

impl Display for Environment {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let env = match self {
            Self::Development => "development",
            Self::Production => "production",
            Self::Testing => "testing",
            Self::Other(env) => env.as_str(),
        };

        write!(f, "{env}")
    }
}

impl From<&str> for Environment {
    fn from(env: &str) -> Self {
        match env.to_lowercase().trim() {
            "dev" | "development" => Self::Development,
            "prod" | "production" => Self::Production,
            "test" | "testing" => Self::Testing,
            _ => Self::Other(env.trim().to_string()),
        }
    }
}
