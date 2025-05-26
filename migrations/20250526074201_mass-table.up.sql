-- Add up migration script here
CREATE TABLE weight_records (
    id SERIAL PRIMARY KEY,
    animal_pid UUID NOT NULL REFERENCES animals (pid) ON DELETE CASCADE,
    organisation_pid UUID NOT NULL REFERENCES organisations (pid)
    ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users (pid),
    mass DECIMAL(6, 2) NOT NULL,
    notes TEXT,
    record_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX weight_records_animal_pid ON weight_records (animal_pid);
CREATE INDEX weight_records_organisation_pid
ON weight_records (organisation_pid);
CREATE INDEX weight_records_created_by ON weight_records (created_by);

CREATE TRIGGER update_weight_records_timestamp BEFORE UPDATE ON weight_records
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
