#![allow(clippy::missing_const_for_fn)]

use std::borrow::Cow;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterBreed<'a> {
    pub(crate) specie: Cow<'a, str>,
    pub(crate) name: Cow<'a, str>,
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
}
