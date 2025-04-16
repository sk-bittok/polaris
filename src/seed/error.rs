#[derive(Debug, thiserror::Error)]
pub enum SeedError {
    #[error("Seeding file not found")]
    FileNotFound,
    #[error("Only JSON and YAML file types supported")]
    UnsupportedFileType,
    #[error(transparent)]
    IO(#[from] tokio::io::Error),
    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),
    #[error(transparent)]
    SerdeYml(#[from] serde_yml::Error),
}

pub type SeedResult<T> = Result<T, SeedError>;
