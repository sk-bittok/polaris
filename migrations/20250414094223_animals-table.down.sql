-- Add down migration script here

-- Drop Triggers
DROP TRIGGER IF EXISTS update_animals_timestamp ON animals;
DROP TRIGGER IF EXISTS update_breeds_timestamp ON breeds;

-- Drop Indices
DROP INDEX IF EXISTS animals_org_idx;
DROP INDEX IF EXISTS animals_tag_idx;
DROP INDEX IF EXISTS animals_status_idx;

-- DROP animals table
DROP TABLE IF EXISTS animals;

-- Drop breeds and species table
DROP TABLE IF EXISTS breeds;
DROP TABLE IF EXISTS species;
