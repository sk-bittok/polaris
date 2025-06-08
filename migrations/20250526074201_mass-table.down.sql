-- Add down migration script here

-- Dropping indices and triggers
DROP TRIGGER IF EXISTS update_weight_records_timestamp ON weight_records;
DROP TRIGGER IF EXISTS set_previous_mass_trigger ON weight_records;

-- Drop indices
DROP INDEX IF EXISTS weight_records_animal_pid;
DROP INDEX IF EXISTS weight_records_organisation_pid;
DROP INDEX IF EXISTS weight_records_created_by;

-- Drop functions
DROP FUNCTION IF EXISTS set_previous_mass();

DROP TABLE IF EXISTS weight_records;
