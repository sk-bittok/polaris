-- Add up migration script here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE subscription_type AS ENUM ('basic', 'business', 'enterprise');

CREATE TABLE organisations (
    id SERIAL PRIMARY KEY,
    pid UUID NOT NULL UNIQUE DEFAULT (uuid_generate_v4()),
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    subscription_type subscription_type DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX organisations_name_idx ON organisations (name);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()  
);

INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Organization administrator with full access', '{"all": true}'::jsonb),
('manager', 'Can manage farm operations and reports', '{"read": true, "write": true, "delete": true, "manage_users": false}'::jsonb),
('staff', 'Basic access to record data and view reports', '{"read": true, "write": true, "delete": false, "manage_users": false}'::jsonb);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    pid UUID NOT NULL UNIQUE DEFAULT (uuid_generate_v4()),
    organisation_pid UUID REFERENCES organisations (pid) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL REFERENCES roles (name),
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(100),
    reset_token_sent_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    last_password_change TIMESTAMP WITH TIME ZONE,
    password_change_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(email, organisation_pid)
);

CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_username_idx ON users (first_name, last_name);
CREATE INDEX users_org_pid_idx ON users (organisation_pid);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organisations_timestamp BEFORE UPDATE ON organisations
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    organisation_pid UUID REFERENCES organisations (pid) ON DELETE CASCADE,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES users (pid),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_logs_org_idx ON audit_logs (organisation_pid);
CREATE INDEX audit_logs_table_record_idx ON audit_logs (table_name, record_id);

CREATE OR REPLACE FUNCTION process_audit() 
RETURNS TRIGGER AS $$
DECLARE
    organisation_pid UUID;
    audit_row audit_logs;
    include_row BOOLEAN;
    excluded_cols TEXT[] := ARRAY['created_at', 'updated_at'];
BEGIN
    -- Determine which organization this record belongs to
    IF TG_TABLE_NAME = 'organisations' THEN
        -- For organizations table, use the direct pid
        IF (TG_OP = 'DELETE') THEN
            organisation_pid := OLD.pid;
        ELSE
            organisation_pid := NEW.pid;
        END IF;
    ELSIF TG_TABLE_NAME = 'users' THEN
        -- For users table, get the organization_pid directly
        IF (TG_OP = 'DELETE') THEN
            organisation_pid := OLD.organisation_pid;
        ELSE
            organisation_pid := NEW.organisation_pid;
        END IF;
    -- ELSEIF TG_TABLE_NAME = 'animals' THEN
    --     -- For animals table, get the organisation_pid directly
    --     IF (TG_OP = 'DELETE') THEN
    --         organisation_pid := OLD.organisation_pid;
    --     ELSE
    --         organisation_pid := NEW.organisation_pid;
    --     END IF;
    ELSE
        -- For other tables that might have user_pid but not direct org reference
        organisation_pid := NULL;
    END IF;

    -- Insert directly without using ROW constructor for the full record
    INSERT INTO audit_logs (
        organisation_pid,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by,
        changed_at
    ) VALUES (
        organisation_pid,
        TG_TABLE_NAME::VARCHAR(50),
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::VARCHAR
            ELSE NEW.id::VARCHAR
        END,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE'
            THEN jsonb_strip_nulls(to_jsonb(OLD) - excluded_cols)
            ELSE NULL
        END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE'
            THEN jsonb_strip_nulls(to_jsonb(NEW) - excluded_cols)
            ELSE NULL
        END,
        CASE
            WHEN current_setting('app.current_user_pid', true) IS NOT NULL 
            THEN (current_setting('app.current_user_pid', true))::UUID
            ELSE NULL
        END,
        NOW()
    );
    
    -- Return the appropriate record based on the operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trigger for organisations table
CREATE TRIGGER audit_organisations_trigger
AFTER INSERT OR UPDATE ON organisations
FOR EACH ROW EXECUTE FUNCTION process_audit();

-- Audit trigger for org's delete query
-- CREATE TRIGGER audit_organisations_delete_trigger
-- BEFORE DELETE ON organisations
-- FOR EACH ROW EXECUTE FUNCTION process_audit();

-- Audit trigger for users table
CREATE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION process_audit();

-- Audit trigger for users's delete query
-- CREATE TRIGGER audit_users_delete_trigger
-- BEFORE DELETE ON users
-- FOR EACH ROW EXECUTE FUNCTION process_audit();

