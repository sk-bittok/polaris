export default interface BaseRecord {
	id: number;
	animalName: string;
	animalPid?: string;
	animalTagId: string;
	organisationName: string;
	organisationPid: string;
	notes?: string;
	createdBy: string;
	createdByName: string;
	createdAt: Date;
	updatedAt: Date;
	recordDate?: Date | string;
}

export interface ProductionRecordResponse extends BaseRecord {
	unit: string;
	quantity: string;
	quality?: string;
	productType: string;
}

export interface ProductionRecord {
	id: number;
	animal_pid: string;
	organisation_pid: string;
	product_type: string;
	quantity: number;
	unit: string;
	record_date?: string;
	quality?: string;
	notes?: string;
	created_by: string;
	created_at: Date;
	updated_at: Date;
}

export interface HealthRecordResponse extends BaseRecord {
	condition: string;
	description: string;
	severity: string;
	status: string;
	treatment: string;
	medicine?: string;
	dosage?: string;
	cost?: number;
	performedBy?: string;
	prognosis?: string;
}

export interface HealthRecord {
	id: number;
	organisation_pid: string;
	animal_pid: string;
	condition: string;
	record_date: Date;
	description: string;
	severity: string;
	status: string;
	treatment: string;
	medicine?: string;
	dosage?: string;
	cost?: number;
	notes?: string;
	performed_by?: string;
	prognosis?: string;
	created_by: string;
	created_at: Date;
	updated_at: Date;
}

export interface WeightRecord {
	id: number;
	organisation_pid: string;
	animal_pid: string;
	mass: number;
	previous_mass: number;
	unit: string;
	status: string;
	record_date: string;
	notes?: string;
	created_by: string;
	created_at: Date;
	updated_at: Date;
}

export interface WeightRecordResponse {
	mass: number;
	status: string;
	previousMass: number;
	unit: string;
}

export type RecordData =
	| ProductionRecordResponse
	| WeightRecordResponse
	| HealthRecordResponse;

export type RecordType = "production" | "weight" | "health";
