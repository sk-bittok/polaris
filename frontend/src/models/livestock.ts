
export interface Breed {
  id: number;
  organisationPid?: string;
  specie: Category;
  name: string;
  maleWeightRange?: string;
  femaleWeightRange?: string;
  gestationPeriod?: string;
  description?: string;
  createdAt: string;
  isSystemDefined: boolean;
}

export enum Category {
  Cattle = "cattle",
  Sheep = "sheep",
  Goat = "goats",
  Chicken = "chicken",
  Pig = "pigs"
}

export enum Gender {
  Male = "male",
  Female = "female",
  Unkown = "unkown",
}

export enum Status {
  Active = "active",
  Sold = "sold",
  Deceased = "deceased",
  Transferred = "transferred"
}

export interface RegisterLivestock {
  tagId: string;
  name: string;
  gender: string;
  status: string;
  breed: string;
  specie: string;
  dateOfBirth?: string | Date | null;
  weightAtBirth?: number | null;
  maleParentId?: string | null;
  femaleParentId?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | Date | null;
  currentWeight?: number | null;
  notes?: string | null;
};

export interface UpdateLivestock {
  tagId?: string | null;
  name?: string | null;
  gender?: string | null;
  status?: string | null;
  breed?: string | null;
  specie?: string | null;
  dateOfBirth?: string | Date | null;
  weightAtBirth?: number | null;
  maleParentId?: string | null;
  femaleParentId?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | Date | null;
  currentWeight?: number | null;
  notes?: string | null;
};

export interface Livestock {
  id: number;
  pid: string;
  organisationName: string;
  tagId: string;
  name: string;
  breedName: string;
  specieName: Category;
  dateOfBirth?: Date;
  gender: Gender;
  parentMaleName?: string;
  parentFemaleName?: string;
  status: Status;
  parentMaleTagId?: string;
  parentFemaleTagId?: string;
  purchaseDate?:  Date;
  purchasePrice?: string;
  weightAtBirth?: string;
  currentWeight?: string;
  notes?: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

