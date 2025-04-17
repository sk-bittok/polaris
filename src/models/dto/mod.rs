#![allow(clippy::missing_const_for_fn)]
pub mod animals;
pub mod auth;

use std::collections::BTreeMap;

use validator::Validate;

pub use self::{animals::*, auth::*};

use super::{ModelError, ModelResult};

pub struct Validator<'a, T>(pub &'a T)
where
    T: Validate + Clone;

impl<'a, T> Validator<'a, T>
where
    T: Validate + Clone,
{
    pub fn new(t: &'a T) -> Self {
        Self(t)
    }

    ///  Function to validate User input
    ///
    /// # Errors
    /// This function will err if:
    /// * Any of the fields fails to meet the specified conditions.
    pub fn validate(&self) -> ModelResult<&T> {
        let validated = self.0.validate();

        match validated {
            Ok(()) => Ok(self.0),
            Err(e) => {
                let mut errors = BTreeMap::new();

                for (key, value) in e.field_errors() {
                    errors.insert(
                        key.to_string(),
                        value
                            .iter()
                            .map(|val_err| val_err.message.as_deref().unwrap_or("field error"))
                            .collect::<Vec<&str>>()
                            .join(", "),
                    );
                }

                Err(ModelError::Validation(
                    serde_json::json!(errors).to_string(),
                ))
            }
        }
    }
}
