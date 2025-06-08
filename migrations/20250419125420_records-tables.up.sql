-- Add up migration script here

-- Production records table for animal products such as milk, meat, eggs, wool, mohair etc.
CREATE TABLE production_records (
    id SERIAL PRIMARY KEY,
    animal_pid UUID NOT NULL REFERENCES animals (pid) ON DELETE CASCADE,
    organisation_pid UUID NOT NULL REFERENCES organisations (pid),
    product_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quality VARCHAR(50),
    notes TEXT,
    record_date DATE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users (pid),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX production_records_animal_pid_idx ON production_records (animal_pid);
CREATE INDEX production_records_org_pid_idx ON production_records (organisation_pid);
CREATE INDEX production_records_date_idx ON production_records (record_date);

-- Health records
CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    animal_pid UUID NOT NULL REFERENCES animals (pid) ON DELETE CASCADE,
    organisation_pid UUID NOT NULL REFERENCES organisations (pid) ON DELETE CASCADE,
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('injury', 'vaccination', 'infection', 'checkup', 'fever')),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('high', 'low', 'medium')),
    status VARCHAR(50) NOT NULL CHECK (status in ('recovered', 'recovering', 'deceased', 'worsened', 'active')),
    record_date DATE NOT NULL,
    description TEXT NOT NULL,
    treatment VARCHAR(255),
    medicine VARCHAR(255),
    dosage VARCHAR(100),
    cost DECIMAL(10, 2),
    performed_by VARCHAR(100),
    prognosis VARCHAR(255),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users (pid),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX health_records_animal_pid_idx ON health_records (animal_pid);
CREATE INDEX health_records_org_pid_idx ON health_records (organisation_pid);
CREATE INDEX health_records_date_idx ON health_records (record_date);

CREATE TRIGGER update_health_records_timestamp BEFORE UPDATE ON health_records
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_production_records_timestamp BEFORE UPDATE ON production_records
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
