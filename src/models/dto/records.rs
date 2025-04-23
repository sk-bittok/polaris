use std::borrow::Cow;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewProductionRecord<'a> {
    pub production_type: Cow<'a, str>,
    pub quantity: i64,
    pub unit: Cow<'a, str>,
    pub quality: Option<Cow<'a, str>>,
    pub notes: Option<Cow<'a, str>>,
    pub date: Option<Cow<'a, str>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewHealthRecord<'a> {
    pub date: Cow<'a, str>,
    pub record_type: Cow<'a, str>,
    pub description: Cow<'a, str>,
    pub treatement: Cow<'a, str>,
    pub medicine: Option<Cow<'a, str>>,
    pub dosage: Option<Cow<'a, str>>,
    pub cost: Option<i64>,
    pub performed_by: Option<Cow<'a, str>>,
    pub notes: Option<Cow<'a, str>>,
}
