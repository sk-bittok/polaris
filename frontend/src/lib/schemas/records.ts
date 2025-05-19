export interface NewProductionRecord {
  tagId: string;
  productionType: string;
  quantity: number;
  unit: string;
  quality?: string;
  notes?: string;
  date?: string;
}
