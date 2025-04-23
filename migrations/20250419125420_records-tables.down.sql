-- Add down migration script here

-- Drop triggers
DROP TRIGGER IF EXISTS update_production_records_timestamp ON production_records;
DROP TRIGGER IF EXISTS update_health_records_timestamp ON health_records;

-- Drop indices
DROP INDEX IF EXISTS production_records_animal_pid_idx;
DROP INDEX IF EXISTS production_records_org_pid_idx;
DROP INDEX IF EXISTS production_records_date_idx;

-- Drop table
DROP TABLE IF EXISTS production_records;

-- Drop indices
DROP INDEX IF EXISTS health_records_animal_pid_idx;
DROP INDEX IF EXISTS health_records_org_pid_idx;
DROP INDEX IF EXISTS health_records_date_idx;

-- Drop table
DROP TABLE IF EXISTS health_records;
