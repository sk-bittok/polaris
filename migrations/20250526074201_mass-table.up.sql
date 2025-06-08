-- Add up migration script here
CREATE TABLE weight_records (
    id SERIAL PRIMARY KEY,
    animal_pid UUID NOT NULL REFERENCES animals (pid) ON DELETE CASCADE,
    organisation_pid UUID NOT NULL REFERENCES organisations (pid)
    ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users (pid),
    mass DECIMAL(6, 2) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    previous_mass DECIMAL(6, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('underweight', 'overweight', 'normal')),
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

-- Function to set previous_mass before inserting a new weight record
CREATE OR REPLACE FUNCTION set_previous_mass()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the most recent mass for this animal
    SELECT mass INTO NEW.previous_mass
    FROM weight_records
    WHERE animal_pid = NEW.animal_pid
        AND record_date < NEW.record_date  -- Only consider records before this one chronologically
    ORDER BY record_date DESC, created_at DESC
    LIMIT 1;
    
    -- If no previous record exists, set previous_mass to 0 or NULL
    -- You can adjust this default behavior as needed
    IF NEW.previous_mass IS NULL THEN
        NEW.previous_mass = 0.00;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs before insert
CREATE TRIGGER set_previous_mass_trigger
    BEFORE INSERT ON weight_records
    FOR EACH ROW
    EXECUTE FUNCTION set_previous_mass();
