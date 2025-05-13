#![allow(clippy::missing_const_for_fn)]

use std::borrow::Cow;

use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::Error;

#[derive(Debug, Deserialize, Clone, Serialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RegisterBreed<'a> {
    #[validate(length(min = 1, max = 50, message = "Specie must be between 1-50 chars"))]
    pub(crate) specie: Cow<'a, str>,
    #[validate(length(min = 3, max = 100, message = "Name must be between 3-100 chars"))]
    pub(crate) name: Cow<'a, str>,
    #[validate(length(
        min = 20,
        max = 2500,
        message = "Description must be between 20-2500 characters"
    ))]
    pub(crate) description: Option<Cow<'a, str>>,
    pub(crate) typical_male_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_female_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_gestation_period: Option<Cow<'a, str>>,
}

impl<'a> RegisterBreed<'a> {
    #[must_use]
    pub fn new(specie: &'a str, name: &'a str) -> Self {
        Self {
            specie: Cow::Borrowed(specie),
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

    #[must_use]
    pub fn specie(&self) -> &str {
        &self.specie
    }
}

#[derive(Debug, Deserialize, Validate, Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct UpdateBreed<'a> {
    pub(crate) specie: Option<Cow<'a, str>>,
    pub(crate) name: Option<Cow<'a, str>>,
    pub(crate) description: Option<Cow<'a, str>>,
    pub(crate) typical_male_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_female_weight_range: Option<Cow<'a, str>>,
    pub(crate) typical_gestation_period: Option<Cow<'a, str>>,
}

impl<'a> UpdateBreed<'a> {
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

    #[must_use]
    pub fn specie(mut self, specie: &'a str) -> Self {
        self.specie = Some(Cow::Borrowed(specie));
        self
    }

    #[must_use]
    pub fn name(mut self, name: &'a str) -> Self {
        self.name = Some(Cow::Borrowed(name));
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
    pub gender: Cow<'a, str>,
    pub status: Cow<'a, str>,
    pub specie: Cow<'a, str>,
    pub breed: Cow<'a, str>,
    pub date_of_birth: Option<Cow<'a, str>>,
    pub female_parent_id: Option<Cow<'a, str>>,
    pub male_parent_id: Option<Cow<'a, str>>,
    pub purchase_date: Option<Cow<'a, str>>,
    pub purchase_price: Option<i64>,
    pub weight_at_birth: Option<i64>,
    pub current_weight: Option<i64>,
    pub notes: Option<Cow<'a, str>>,
}

#[derive(Debug, Deserialize, Validate, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAnimal<'a> {
    pub tag_id: Option<Cow<'a, str>>,
    pub name: Option<Cow<'a, str>>,
    pub gender: Option<Cow<'a, str>>,
    pub status: Option<Cow<'a, str>>,
    pub specie: Option<Cow<'a, str>>,
    pub breed: Option<Cow<'a, str>>,
    pub date_of_birth: Option<Cow<'a, str>>,
    pub female_parent_id: Option<Cow<'a, str>>,
    pub male_parent_id: Option<Cow<'a, str>>,
    pub purchase_date: Option<Cow<'a, str>>,
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
