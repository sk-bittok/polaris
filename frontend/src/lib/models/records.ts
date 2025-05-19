export interface ProductionRecord {
  id: number;
  livestockName: string;
  organisationPid: string;
  organisationName: string;
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
