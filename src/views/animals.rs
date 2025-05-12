use chrono::{DateTime, FixedOffset, NaiveDate};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{Encode, prelude::FromRow};
use uuid::Uuid;

use crate::models::breeds::Breed;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BreedResponse {
    pub id: i32,
    pub organisation_pid: Option<String>,
    pub specie: String,
    pub name: String,
    pub male_weight_range: Option<String>,
    pub female_weight_range: Option<String>,
    pub gestation_period: Option<String>,
    pub description: Option<String>,
    pub created_at: String,
    pub is_system_defined: bool,
}

impl BreedResponse {
    #[must_use]
    pub fn new(breed: &Breed, specie: &str) -> Self {
        Self {
            id: breed.id,
            organisation_pid: breed.organisation_pid.map(Into::into),
            specie: specie.into(),
            name: breed.name.to_string(),
            male_weight_range: breed.typical_male_weight_range.as_ref().map(Into::into),
            female_weight_range: breed.typical_female_weight_range.as_ref().map(Into::into),
            gestation_period: breed.typical_gestation_period.as_ref().map(Into::into),
            description: breed.description.as_ref().map(Into::into),
            created_at: breed.created_at.format("%d-%m-%Y %H:%M").to_string(),
            is_system_defined: breed.is_system_defined,
        }
    }
}

#[derive(Debug, Deserialize, FromRow, Encode, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnimalResponse {
    pub(crate) id: i32,
    pub(crate) pid: Uuid,
    pub(crate) organisation_name: String,
    pub(crate) tag_id: String,
    pub(crate) name: String,
    pub(crate) specie_name: String,
    pub(crate) breed_name: String,
    pub(crate) date_of_birth: Option<NaiveDate>,
    pub(crate) gender: String,
    pub(crate) parent_female_name: Option<String>,
    pub(crate) parent_male_name: Option<String>,
    pub(crate) status: String,
    pub(crate) purchase_date: Option<NaiveDate>,
    pub(crate) purchase_price: Option<Decimal>,
    pub(crate) weight_at_birth: Option<Decimal>,
    pub(crate) current_weight: Option<Decimal>,
    pub(crate) notes: Option<String>,
    pub(crate) created_by_name: String,
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) updated_at: DateTime<FixedOffset>,
}
