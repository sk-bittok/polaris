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
