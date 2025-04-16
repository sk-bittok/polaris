#![allow(clippy::missing_const_for_fn)]
#![allow(clippy::equatable_if_let)]
#![allow(clippy::use_self)]

use chrono::{DateTime, FixedOffset};
use serde::Deserialize;
use serde_json::{Map, Value};
use sqlx::types::Json;

/// Represents [`User`] permissions i.e Read, Write and Delete
#[derive(Debug, Deserialize, Clone)]
pub struct Permission {
    permissions: u8,
}

impl Permission {
    const PERMISSION_READ: u8 = 0b0001;
    const PERMISSION_WRITE: u8 = 0b0010;
    const PERMISSION_DELETE: u8 = 0b0100;
    const PERMISSION_MANAGE_USERS: u8 = 0b1000;
    const PERMISSION_ALL: u8 = 0b1111;

    #[must_use]
    pub fn new() -> Self {
        Self { permissions: 0 }
    }

    #[must_use]
    pub fn from_bits(bits: u8) -> Self {
        Self { permissions: bits }
    }

    fn has_permission(&self, flag: u8) -> bool {
        self.permissions & flag == flag
    }

    fn set_permission(&mut self, flag: u8, value: bool) {
        if value {
            self.permissions |= flag;
        } else {
            self.permissions &= !flag;
        }
    }

    // Read Permission getters/setters
    #[must_use]
    pub fn can_read(&self) -> bool {
        self.has_permission(Self::PERMISSION_READ)
    }

    pub fn set_read(&mut self, value: bool) {
        self.set_permission(Self::PERMISSION_READ, value);
    }

    // Write Permission getters/setters
    #[must_use]
    pub fn can_write(&self) -> bool {
        self.has_permission(Self::PERMISSION_WRITE)
    }

    pub fn set_write(&mut self, value: bool) {
        self.set_permission(Self::PERMISSION_WRITE, value);
    }

    // Delete Permission getters/setters
    #[must_use]
    pub fn can_delete(&self) -> bool {
        self.has_permission(Self::PERMISSION_DELETE)
    }

    pub fn set_delete(&mut self, value: bool) {
        self.set_permission(Self::PERMISSION_DELETE, value);
    }

    // Manage users Permission getter/setter
    #[must_use]
    pub fn can_manage_users(&self) -> bool {
        self.has_permission(Self::PERMISSION_MANAGE_USERS)
    }

    pub fn set_manage_users(&mut self, value: bool) {
        self.set_permission(Self::PERMISSION_MANAGE_USERS, value);
    }

    #[must_use]
    pub fn has_all_permissions(&self) -> bool {
        self.permissions & Self::PERMISSION_ALL == Self::PERMISSION_ALL
    }

    pub fn set_all(&mut self, value: bool) {
        if value {
            self.permissions = Self::PERMISSION_ALL;
        } else {
            self.permissions = 0;
        }
    }

    #[must_use]
    pub fn admin() -> Self {
        Self {
            permissions: Self::PERMISSION_ALL,
        }
    }
}

impl Default for Permission {
    fn default() -> Self {
        Self::new()
    }
}

impl From<Map<String, Value>> for Permission {
    fn from(map: Map<String, Value>) -> Self {
        let mut permission = Self::new();

        if let Some(Value::Bool(true)) = map.get("all") {
            permission.set_all(true);
            return permission;
        }

        if let Some(Value::Bool(value)) = map.get("read") {
            permission.set_read(*value);
        }

        if let Some(Value::Bool(value)) = map.get("write") {
            permission.set_write(*value);
        }

        if let Some(Value::Bool(value)) = map.get("delete") {
            permission.set_delete(*value);
        }

        if let Some(Value::Bool(value)) = map.get("manage_users") {
            permission.set_manage_users(*value);
        }

        permission
    }
}

impl From<Permission> for Map<String, Value> {
    fn from(permission: Permission) -> Self {
        let mut map: Map<String, Value> = Map::new();

        if permission.has_all_permissions() {
            map.insert("all".to_string(), Value::Bool(true));
            return map;
        }

        map.insert("read".into(), Value::Bool(permission.can_read()));
        map.insert("write".into(), Value::Bool(permission.can_write()));
        map.insert("delete".into(), Value::Bool(permission.can_delete()));
        map.insert(
            "manage_users".into(),
            Value::Bool(permission.can_manage_users()),
        );

        map
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct Role {
    pub(crate) id: i32,
    pub(crate) name: String,
    pub(crate) permission: Json<Permission>,
    pub(crate) description: Option<String>,
    pub(crate) created_at: DateTime<FixedOffset>,
}

impl Role {
    #[must_use]
    pub fn id(&self) -> i32 {
        self.id
    }

    #[must_use]
    pub fn name(&self) -> &str {
        &self.name
    }

    #[must_use]
    pub fn permission(&self) -> &Json<Permission> {
        &self.permission
    }

    #[must_use]
    pub fn description(&self) -> Option<&str> {
        self.description
            .as_ref()
            .map_or_else(|| None, |desc: &String| Some(desc.as_str()))
    }

    #[must_use]
    pub fn created_at(&self) -> DateTime<FixedOffset> {
        self.created_at
    }
}
