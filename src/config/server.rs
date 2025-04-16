use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct ServerConfig {
    pub(crate) protocol: String,
    pub(crate) host: String,
    pub(crate) port: u16,
}

impl ServerConfig {
    #[must_use]
    pub fn url(&self) -> String {
        format!("{}://{}:{}", &self.protocol, &self.host, self.port)
    }

    #[must_use]
    pub fn address(&self) -> String {
        format!("{}:{}", &self.host, self.port)
    }
}
