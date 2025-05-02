use serde::Serialize;

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
            female_weight_range: breed.typical_male_weight_range.as_ref().map(Into::into),
            gestation_period: breed.typical_gestation_period.as_ref().map(Into::into),
            description: breed.description.as_ref().map(Into::into),
            created_at: breed.created_at.format("%d-%m-%Y %H:%M").to_string(),
            is_system_defined: breed.is_system_defined,
        }
    }
}
