export interface ProductionRecord {
	id: number;
	livestockName: string;
	animalPid: string;
	productType: string;
	unit: string;
	quantity: string;
	notes?: string;
	quality?: string;
	recordDate?: Date;
	createdAt: Date;
	createdBy: string;
	createdByName: string;
	updatedAt: Date;
}

export interface NewProductionRecord {
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

export interface HealthRecordResponse {
	id: number;
	organisationPid: string;
	organisationName: string;
	animalName: string;
	animalPid: string;
	animalTagId: string;
	recordType: string;
	recordDate: Date;
	description: string;
	treatment: string;
	medicine?: string;
	dosage?: string;
	cost?: number;
	notes?: string;
	performedBy?: string;
	createdBy: string;
	createdByName: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface HealthRecord {
	id: number;
	organisation_pid: string;
	animal_pid: string;
	record_type: string;
	record_date: Date;
	description: string;
	treatment: string;
	medicine?: string;
	dosage?: string;
	cost?: number;
	notes?: string;
	performed_by?: string;
	created_by: string;
	created_at: Date;
	updated_at: Date;
}

export interface WeightRecord {
	id: number;
	organisation_pid: string;
	animal_pid: string;
	mass: number;
	record_date: string;
	notes?: string;
	created_by: string;
	created_at: Date;
	updated_at: Date;
}

export interface WeightRecordResponse {
	id: number;
	organisationPid: string;
	organisationName: string;
	animalPid: string;
	animalName: string;
	animalTagId: string;
	mass: number;
	recordDate: string;
	notes?: string;
	createdBy: string;
	createdByName: string;
	created_at: Date;
	updated_at: Date;
}
