import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MedicineReturnsService {

  constructor(private httpClient: HttpClient) { }

  savePatientMedicineReturn(medicineReturn: PatientMedicineReturn) {
    const href = environment.POS_PATIENT_RETURN_API_URL;
    return this.httpClient.post<any>(href, medicineReturn);
  }

  getMedicineReturns() {
    const href = environment.POS_PATIENT_RETURN_API_URL;
    return this.httpClient.get<any>(href);
  }
}

export interface PatientMedicineReturn {
  header: PatientMedicineReturnHeader;
  details: PatientMedicineReturnDetails[];
}

export interface PatientMedicineReturnHeader {
  totalAmount: number;
  reason: string;
  posId: bigint;
}

export interface PatientMedicineReturnDetails {
  posId: bigint;
  brandId: bigint;
  productId: bigint;
  qty: number;
  sellingPrice: number;
  productHistoryId: bigint;
}
