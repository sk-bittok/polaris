-- Add down migration script here

DROP TRIGGER IF EXISTS update_livestock_summary_timestamp ON livestock_summary;
DROP TRIGGER IF EXISTS update_species_summary_timestamp ON species_summary;
DROP TRIGGER IF EXISTS update_breed_summary_timestamp ON breed_summary;

DROP INDEX IF EXISTS livestock_summary_org_idx;

DROP INDEX IF EXISTS species_summary_org_idx;
DROP INDEX IF EXISTS species_summary_specie_idx;
DROP INDEX IF EXISTS species_summary_calculated_idx;

DROP INDEX IF EXISTS breed_summary_org_idx;
DROP INDEX IF EXISTS breed_summary_breed_idx;
DROP INDEX IF EXISTS breed_summary_specie_idx;
DROP INDEX IF EXISTS breed_summary_calculated_idx;

DROP TABLE IF EXISTS breed_summary;
DROP TABLE IF EXISTS species_summary;
DROP TABLE IF EXISTS livestock_summary;
