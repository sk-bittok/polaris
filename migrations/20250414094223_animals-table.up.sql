-- Add up migration script here

-- Livestock categories
CREATE TABLE species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(name)
);

INSERT INTO species (name, description) VALUES
('cattle', 'Beef and dairy cattle'),
('sheep', 'All sheep breeds'),
('goats', 'All goat breeds'),
('pigs', 'All pig breeds'),
('chicken', 'Broilers and layers domestic fowls');

-- Breeds table
CREATE TABLE breeds (
    id SERIAL PRIMARY KEY,
    specie VARCHAR(100) NOT NULL REFERENCES species(name),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    typical_male_weight_range VARCHAR(50),
    typical_female_weight_range VARCHAR(50),
    typical_gestation_period VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_system_defined BOOLEAN DEFAULT FALSE,
    organisation_pid UUID REFERENCES organisations (pid) ON DELETE CASCADE,
    UNIQUE(specie, name),
    CONSTRAINT validate_breed_ownership CHECK (
            (is_system_defined = TRUE AND organisation_pid IS NULL) OR
            (is_system_defined = FALSE AND organisation_pid IS NOT NULL))
);

-- Prepopulate the breeds table with popular breeds
INSERT INTO breeds (specie, name, description, typical_male_weight_range, typical_female_weight_range, typical_gestation_period, is_system_defined) VALUES
        ('cattle', 'Aberdeen Angus', 'Beef cattle with red or black coat', '750-950', '500-550', '283 days', TRUE),
        ('cattle', 'Hereford', 'Beef cattle spotting a red coat with a white head and socks', '1000-1045', '545-680', '285 days', TRUE),
        ('cattle', 'Beef Shorthorn', 'Red, white or roan coloured beef cattle', '1100-1300', '600-800', '284 days', TRUE),
        ('cattle', 'Friesian-Holstein', 'Black and white dairy cattle', '1150-1200', '650-750', '279 days', TRUE);

-- Main livestock table
CREATE TABLE animals (
    id SERIAL PRIMARY KEY,
    pid UUID NOT NULL UNIQUE DEFAULT (uuid_generate_v4()),
    organisation_pid UUID NOT NULL REFERENCES organisations (pid) ON DELETE CASCADE,
    tag_id VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    specie VARCHAR(100) NOT NULL REFERENCES species(name),
    breed_id INTEGER NOT NULL REFERENCES breeds(id),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    parent_female_id UUID REFERENCES animals (pid),
    parent_male_id UUID REFERENCES animals (pid),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased', 'transferred')),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    weight_at_birth DECIMAL(6, 2),
    current_weight DECIMAL(6, 2),
    notes TEXT,
    created_by UUID REFERENCES users (pid),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(organisation_pid, tag_id)
);

CREATE INDEX animals_org_idx ON animals (organisation_pid);
CREATE INDEX animals_tag_idx ON animals (tag_id);
CREATE INDEX animals_status_idx ON animals (status);

CREATE TRIGGER update_animals_timestamp BEFORE UPDATE ON animals
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Audit trigger for users table
CREATE TRIGGER audit_animals_trigger
AFTER INSERT OR UPDATE OR DELETE ON animals
FOR EACH ROW EXECUTE FUNCTION process_audit()
