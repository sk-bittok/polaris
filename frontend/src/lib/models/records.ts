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
	organisationPid: string;
	animalPid: string;
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
	createdAt: Date;
	updatedAt: Date;
}
