use std::borrow::Cow;

use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};

use crate::models::orgs::RegisterOrg;

#[derive(Debug, Clone, Deserialize, Serialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RegisterAdmin<'a> {
    #[validate(email(message = "Invalid e-mail address"))]
    pub email: Cow<'a, str>,
    #[validate(length(min = 2, max = 50, message = "First name must have 2-50 characters"))]
    pub first_name: Cow<'a, str>,
    #[validate(length(min = 2, max = 50, message = "Last name must have 2-50 characters"))]
    pub last_name: Cow<'a, str>,
    #[validate(length(min = 5, max = 50, message = "Password must have 8-48 characters"))]
    pub password: Cow<'a, str>,
    #[validate(must_match(other = "password", message = "Passwords must match"))]
    pub confirm_password: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Clone, Validate)]
pub struct LoginUser<'a> {
    #[validate(email(message = "Invalid e-mail address"))]
    pub email: Cow<'a, str>,
    #[validate(length(min = 5, max = 50, message = "Password must have 8-48 characters"))]
    pub password: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Clone, Validate)]
pub struct UpdatePassword<'a> {
    #[validate(email(message = "Invalid e-mail address"))]
    pub email: Cow<'a, str>,
    #[validate(length(min = 5, max = 50, message = "Password must have 8-48 characters"))]
    pub password: Cow<'a, str>,
    #[validate(must_match(other = "password", message = "Passwords must match"))]
    pub confirm_password: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Serialize, Clone, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateNewUser<'a> {
    #[validate(email(message = "Invalid e-mail address"))]
    pub email: Cow<'a, str>,
    #[validate(length(min = 5, max = 50, message = "First name must have 5-50 characters"))]
    pub first_name: Cow<'a, str>,
    #[validate(length(min = 5, max = 50, message = "Last name must have 5-50 characters"))]
    pub last_name: Cow<'a, str>,
    #[validate(custom(function = "validate_role"))]
    pub role: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RegisterAdminParams<'a> {
    pub organisation: RegisterOrg<'a>,
    pub user: RegisterAdmin<'a>,
}

fn validate_role(role: &str) -> Result<(), ValidationError> {
    match role.to_lowercase().trim() {
        "admin" | "manager" | "staff" => Ok(()),
        _ => Err(ValidationError::new("invalid_role")
            .with_message(Cow::Borrowed("Only admin, manager and staff roles allowed"))),
    }
}
