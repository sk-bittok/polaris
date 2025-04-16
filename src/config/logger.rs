#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unused_self)]
use std::{
    env::VarError,
    error::Error,
    fmt::{self, Display, Formatter},
    io::IsTerminal,
    str::FromStr,
};

use serde::{Deserialize, Serialize};
use tracing::Subscriber;
use tracing_error::ErrorLayer;
use tracing_subscriber::{
    EnvFilter,
    filter::Directive,
    fmt::Layer as FmtLayer,
    layer::{Layer, SubscriberExt},
    registry::LookupSpan,
    util::SubscriberInitExt,
};

use super::{ConfigError, ConfigResult};

#[derive(Debug, Default, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub enum Format {
    #[serde(rename = "compact")]
    Compact,
    #[serde(rename = "full")]
    Full,
    #[serde(rename = "json")]
    Json,
    #[serde(rename = "pretty")]
    #[default]
    Pretty,
}

impl Display for Format {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let fmt = match self {
            Self::Compact => "compact",
            Self::Full => "full",
            Self::Json => "json",
            Self::Pretty => "pretty",
        };

        write!(f, "{fmt}")
    }
}

#[derive(Debug, Default, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub enum Level {
    #[serde(rename = "debug")]
    Debug,
    #[serde(rename = "error")]
    Error,
    #[serde(rename = "info")]
    #[default]
    Info,
    #[serde(rename = "off")]
    Off,
    #[serde(rename = "trace")]
    Trace,
    #[serde(rename = "warn")]
    Warn,
}

impl Display for Level {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let level = match self {
            Self::Debug => "debug",
            Self::Error => "error",
            Self::Info => "info",
            Self::Off => "off",
            Self::Trace => "trace",
            Self::Warn => "warn",
        };

        write!(f, "{level}")
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TelemetryConfig {
    format: Format,
    level: Level,
    directives: Vec<String>,
}

impl TelemetryConfig {
    pub fn setup(&self) -> ConfigResult<()> {
        let env_filter_layer = self.env_filter_layer()?;
        let registry = tracing_subscriber::registry()
            .with(env_filter_layer)
            .with(ErrorLayer::default());

        match self.format {
            Format::Compact => registry.with(self.compact_fmt_layer()).try_init()?,
            Format::Full => registry.with(self.base_fmt_layer()).try_init()?,
            Format::Json => registry.with(self.json_fmt_layer()).try_init()?,
            Format::Pretty => registry.with(self.pretty_fmt_layer()).try_init()?,
        }

        Ok(())
    }

    fn env_filter_layer(&self) -> ConfigResult<EnvFilter> {
        let mut env_filter = match EnvFilter::try_from_default_env() {
            Ok(env_filter) => env_filter,
            Err(from_env_err) => {
                if let Some(err) = from_env_err.source() {
                    match err.downcast_ref::<VarError>() {
                        Some(VarError::NotPresent) => (),
                        Some(other) => return Err(ConfigError::Env(other.clone())),
                        _ => return Err(ConfigError::FromEnv(from_env_err)),
                    }
                }

                if self.directives.is_empty() {
                    EnvFilter::try_new(format!(
                        "{}={}",
                        env!("CARGO_PKG_NAME").replace('-', "_"),
                        &self.level
                    ))?
                } else {
                    EnvFilter::try_new("")?
                }
            }
        };

        let parsed_directives = self.directives()?;

        for parsed_directive in parsed_directives {
            env_filter = env_filter.add_directive(parsed_directive);
        }

        Ok(env_filter)
    }

    fn directives(&self) -> ConfigResult<Vec<Directive>> {
        self.directives
            .iter()
            .map(|directive| -> Result<Directive, ConfigError> {
                let str_directive = format!("{}={}", directive, &self.level);
                Ok(Directive::from_str(&str_directive)?)
            })
            .collect()
    }

    fn base_fmt_layer<S>(&self) -> FmtLayer<S>
    where
        S: Subscriber + for<'span> LookupSpan<'span>,
    {
        FmtLayer::new()
            .with_ansi(std::io::stdout().is_terminal())
            // Later implement other writers
            .with_writer(std::io::stdout)
    }

    fn compact_fmt_layer<S>(&self) -> impl Layer<S>
    where
        S: Subscriber + for<'span> LookupSpan<'span>,
    {
        self.base_fmt_layer()
            .compact()
            .with_target(false)
            .with_thread_ids(false)
            .with_thread_names(false)
            .with_file(false)
            .with_line_number(false)
    }

    fn json_fmt_layer<S>(&self) -> impl Layer<S>
    where
        S: Subscriber + for<'span> LookupSpan<'span>,
    {
        self.base_fmt_layer().json()
    }

    fn pretty_fmt_layer<S>(&self) -> impl Layer<S>
    where
        S: Subscriber + for<'span> LookupSpan<'span>,
    {
        self.base_fmt_layer().pretty()
    }
}
