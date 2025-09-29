export interface MedicineApi {
  items: Medicine[];
  totalCount: number;
}

export interface Medicine {
  medicineId: number;
  genericName: string;
  unitId: number;
  unitName: string;
  brandId: number;
  brandName: string;
  dosage: string;
}
