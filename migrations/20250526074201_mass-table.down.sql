-- Add down migration script here

-- Dropping indices and triggers
DROP TRIGGER IF EXISTS update_weight_records_timestamp ON weight_records;
DROP INDEX IF EXISTS weight_records_animal_pid;
DROP INDEX IF EXISTS weight_records_organisation_pid;
DROP INDEX IF EXISTS weight_records_created_by;

DROP TABLE IF EXISTS weight_records;
