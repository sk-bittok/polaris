mod error;

use std::path::Path;

use async_trait::async_trait;
use serde::de::DeserializeOwned;
use sqlx::PgPool;

use crate::models::ModelResult;

pub use self::error::{SeedError, SeedResult};

#[async_trait]
pub trait Seedable: Sized + Send + Sync + DeserializeOwned {
    async fn seed_data(db: &PgPool, data: &[Self]) -> ModelResult<()>;
    async fn load_file(path: &str) -> SeedResult<Vec<Self>> {
        let path_str = format!("src/fixtures/{path}");
        let path = Path::new(&path_str).to_path_buf();

        if !path.is_file() || !path.exists() {
            return Err(SeedError::FileNotFound);
        }

        let contents = tokio::fs::read_to_string(&path).await?;
        let extension = path.extension().ok_or(SeedError::UnsupportedFileType)?;

        if extension.eq_ignore_ascii_case("json") {
            serde_json::from_str::<Vec<Self>>(&contents).map_err(Into::into)
        } else if extension.eq_ignore_ascii_case("yaml") {
            serde_yml::from_str::<Vec<Self>>(&contents).map_err(Into::into)
        } else {
            Err(SeedError::UnsupportedFileType)
        }
    }
}
