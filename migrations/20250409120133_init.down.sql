-- Add down migration script here

-- Drop audit_logs triggers
DROP TRIGGER IF EXISTS audit_organisations_trigger ON organisations;
-- DROP TRIGGER IF EXISTS audit_organisations_delete_trigger ON organisations;
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
-- DROP TRIGGER IF EXISTS audit_users_delete_trigger ON users;


-- Drop function
DROP FUNCTION IF EXISTS process_audit();

-- Drop audit_logs table and its indexes
DROP INDEX IF EXISTS audit_logs_table_record_idx;
DROP INDEX IF EXISTS audit_logs_org_idx;
DROP TABLE IF EXISTS audit_logs;

-- Drop triggers
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
DROP TRIGGER IF EXISTS update_organisations_timestamp ON organisations;

-- Drop functions
DROP FUNCTION IF EXISTS update_timestamp();

-- Drop users table and its indexes
DROP INDEX IF EXISTS users_org_pid_idx;
DROP INDEX IF EXISTS users_username_idx;
DROP INDEX IF EXISTS users_email_idx;
DROP TABLE IF EXISTS users;

-- Drop roles table
DROP TABLE IF EXISTS roles;

-- Drop organisations table and its indexes
DROP INDEX IF EXISTS organisations_name_idx;
DROP TABLE IF EXISTS organisations;

-- Drop custom types
DROP TYPE IF EXISTS subscription_type;

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp";
