

export interface Breed {
  id: number;
  organisationPid?: string;
  specie: string;
  name: string;
  maleWeightRange?: string;
  femalWeightRange?: string;
  gestationPeriod?: string;
  description?: string;
  createdAt: string;
  isSystemDefined: boolean;
}
