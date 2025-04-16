use std::borrow::Cow;

use serde::{Deserialize, Serialize};

use crate::models::orgs::RegisterOrg;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterAdmin<'a> {
    pub email: Cow<'a, str>,
    pub first_name: Cow<'a, str>,
    pub last_name: Cow<'a, str>,
    pub password: Cow<'a, str>,
    pub confirm_password: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct LoginUser<'a> {
    pub email: Cow<'a, str>,
    pub password: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct UpdatePassword<'a> {
    pub email: Cow<'a, str>,
    pub password: Cow<'a, str>,
    pub confirm_password: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CreateNewUser<'a> {
    pub email: Cow<'a, str>,
    pub first_name: Cow<'a, str>,
    pub last_name: Cow<'a, str>,
    pub role: Cow<'a, str>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RegisterAdminParams<'a> {
    pub organisation: RegisterOrg<'a>,
    pub user: RegisterAdmin<'a>,
}
