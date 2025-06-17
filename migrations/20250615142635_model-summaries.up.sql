-- Add up migration script here

CREATE TABLE livestock_summary (
    id SERIAL PRIMARY KEY,
    pid UUID NOT NULL UNIQUE DEFAULT (uuid_generate_v4()),
    organisation_pid UUID NOT NULL REFERENCES organisations(pid) ON DELETE CASCADE,
    total INT NOT NULL,
    males INT NOT NULL,
    females INT NOT NULL,
    unkown_gender INT NOT NULL,
    active INT NOT NULL,
    transferred INT NOT NULL,
    sold INT NOT NULL,
    deceased INT NOT NULL,
    species INT NOT NULL,
    breeds INT NOT NULL,
    total_purchased_value DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX livestock_summary_org_idx ON livestock_summary (organisation_pid);

CREATE TRIGGER update_livestock_summary_timestamp
    BEFORE UPDATE ON livestock_summary
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE species_summary (
      id SERIAL PRIMARY KEY,
      pid UUID NOT NULL UNIQUE DEFAULT (uuid_generate_v4()),
      organisation_pid UUID NOT NULL REFERENCES organisations(pid) ON DELETE CASCADE,
      specie_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE,
      specie_name VARCHAR(100) NOT NULL, -- Denormalized for faster queries
      total INTEGER NOT NULL DEFAULT 0,
      males INTEGER NOT NULL DEFAULT 0,
      females INTEGER NOT NULL DEFAULT 0,
      unknown_gender INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 0,
      sold INTEGER NOT NULL DEFAULT 0,
      deceased INTEGER NOT NULL DEFAULT 0,
      transferred INTEGER NOT NULL DEFAULT 0,
      average_age_months DECIMAL(5,2),
      average_weight_male DECIMAL(8,2),
      average_weight_female DECIMAL(8,2),
      total_purchase_value DECIMAL(12,2),
      last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE(organisation_pid, specie_id)
);


-- Indexes for species_summary
CREATE INDEX species_summary_org_idx ON species_summary (organisation_pid);
CREATE INDEX species_summary_specie_idx ON species_summary (specie_id);
CREATE INDEX species_summary_calculated_idx ON species_summary (last_calculated_at);

-- Trigger for species_summary
CREATE TRIGGER update_species_summary_timestamp 
    BEFORE UPDATE ON species_summary
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Breed Summary Report Table
CREATE TABLE breed_summary (
    id SERIAL PRIMARY KEY,
    pid UUID NOT NULL UNIQUE DEFAULT (uuid_generate_v4()),
    organisation_pid UUID NOT NULL REFERENCES organisations(pid) ON DELETE CASCADE,
    breed_id INTEGER NOT NULL REFERENCES breeds(id) ON DELETE CASCADE,
    breed_name VARCHAR(100) NOT NULL, -- Denormalized for faster queries
    specie_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    specie_name VARCHAR(100) NOT NULL, -- Denormalized for faster queries
    total INTEGER NOT NULL DEFAULT 0,
    males INTEGER NOT NULL DEFAULT 0,
    females INTEGER NOT NULL DEFAULT 0,
    unknown_gender INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 0,
    sold INTEGER NOT NULL DEFAULT 0,
    deceased INTEGER NOT NULL DEFAULT 0,
    transferred INTEGER NOT NULL DEFAULT 0,
    average_age_months DECIMAL(5,2),
    average_weight_male DECIMAL(8,2),
    average_weight_female DECIMAL(8,2),
    average_birth_weight_male DECIMAL(6,2),
    average_birth_weight_female DECIMAL(6,2),
    average_purchase_price DECIMAL(10,2),
    total_purchase_value DECIMAL(12,2),
    youngest_age_months INTEGER,
    oldest_age_months INTEGER,
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(organisation_pid, breed_id)
);

-- Indexes for breed_summary
CREATE INDEX breed_summary_org_idx ON breed_summary (organisation_pid);
CREATE INDEX breed_summary_breed_idx ON breed_summary (breed_id);
CREATE INDEX breed_summary_specie_idx ON breed_summary (specie_id);
CREATE INDEX breed_summary_calculated_idx ON breed_summary (last_calculated_at);

-- Trigger for breed_summary
CREATE TRIGGER update_breed_summary_timestamp 
    BEFORE UPDATE ON breed_summary
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
