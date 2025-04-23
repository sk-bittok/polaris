#![allow(clippy::missing_const_for_fn)]

use std::borrow::Cow;

use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::Error;

#[derive(Debug, Deserialize, Clone, Serialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RegisterBreed<'a> {
    #[validate(range(min = 1, max = 10000, message = "Specie ID cannot be lower than 1"))]
    pub(crate) specie_id: i32,
    pub(crate) name: Cow<'a, str>,
    #[validate(length(
        min = 3,
        max = 100,
        message = "Specie name must be between 3-100 characters"
    ))]
    pub(crate) description: Option<Cow<'a, str>>,
    pub(crate) typical_male_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_female_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_gestation_period: Option<Cow<'a, str>>,
}

impl<'a> RegisterBreed<'a> {
    #[must_use]
    pub fn new(specie_id: i32, name: &'a str) -> Self {
        Self {
            specie_id,
            name: Cow::Borrowed(name),
            description: None,
            typical_male_weight_range: None,
            typical_female_weight_range: None,
            typical_gestation_period: None,
        }
    }

    #[must_use]
    pub fn male_weight_range(mut self, weight: &'a str) -> Self {
        self.typical_male_weight_range = Some(Cow::Borrowed(weight));
        self
    }

    #[must_use]
    pub fn female_weight_range(mut self, weight: &'a str) -> Self {
        self.typical_female_weight_range = Some(Cow::Borrowed(weight));
        self
    }

    #[must_use]
    pub fn gestation_period(mut self, period: &'a str) -> Self {
        self.typical_gestation_period = Some(Cow::Borrowed(period));
        self
    }

    #[must_use]
    pub fn description(mut self, period: &'a str) -> Self {
        self.description = Some(Cow::Borrowed(period));
        self
    }
}

#[derive(Debug, Deserialize, Validate, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RegisterAnimal<'a> {
    pub tag_id: Cow<'a, str>,
    #[validate(length(
        min = 3,
        max = 100,
        message = "Breed name must be between 3-100 characters"
    ))]
    pub name: Cow<'a, str>,
    #[validate()]
    pub gender: Cow<'a, str>,
    pub status: Cow<'a, str>,
    pub specie_id: i32,
    pub breed_id: i32,
    pub date_of_birth: Option<NaiveDate>,
    pub female_parent_id: Option<Uuid>,
    pub male_parent_id: Option<Uuid>,
    pub purchase_date: Option<NaiveDate>,
    pub purchase_price: Option<i64>,
    pub weight_at_birth: Option<i64>,
    pub current_weight: Option<i64>,
    pub notes: Option<Cow<'a, str>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq)]
pub enum Gender {
    Male,
    Female,
}

impl std::fmt::Display for Gender {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Self::Male => "male",
                Self::Female => "female",
            }
        )
    }
}

impl TryFrom<&str> for Gender {
    type Error = Error;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value.to_lowercase().trim() {
            "male" => Ok(Self::Male),
            "female" => Ok(Self::Female),
            other => Err(Error::Other(format!("{other} is not a valid gender."))),
        }
    }
}
