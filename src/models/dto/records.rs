use std::borrow::Cow;

use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewProductionRecord<'a> {
    pub tag_id: Cow<'a, str>,
    pub production_type: Cow<'a, str>,
    pub quantity: i64,
    pub unit: Cow<'a, str>,
    pub quality: Option<Cow<'a, str>>,
    pub notes: Option<Cow<'a, str>>,
    pub record_date: Option<Cow<'a, str>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewHealthRecord<'a> {
    pub tag_id: Cow<'a, str>,
    pub record_date: Cow<'a, str>,
    pub record_type: Cow<'a, str>,
    pub description: Cow<'a, str>,
    pub treatment: Cow<'a, str>,
    pub medicine: Option<Cow<'a, str>>,
    pub dosage: Option<Cow<'a, str>>,
    pub cost: Option<i64>,
    pub performed_by: Option<Cow<'a, str>>,
    pub notes: Option<Cow<'a, str>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewWeightRecord<'a> {
    pub tag_id: Cow<'a, str>,
    pub record_date: NaiveDate,
    pub mass: i64,
    pub notes: Option<Cow<'a, str>>,
}
