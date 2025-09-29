import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PatientDiagnosisService {

  constructor(private httpClient: HttpClient) { }
  private limit = 30; // Default limit for pagination

  getPatientDiagnosis(): Observable<PatientDiagnosis> {
    const href = environment.PATIENT_DIAGNOSIS_API_URL;
    return this.httpClient.get<PatientDiagnosis>(href);
  }

  getProducts(search: any,
              sort: string,
              order: string,
              page: number): Observable<ProductApi> {

    if (search.productName == null || search.productName === undefined) {
      search.productName = '';
    }

    const href = environment.POS_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=${this.limit}&productName=${encodeURIComponent(search.productName)}&includeNonStock=1`;

    return this.httpClient.get<ProductApi>(requestUrl);
  }

  savePatientDiagnosis(diagnosis: any): Observable<any> {
    const href = environment.PATIENT_DIAGNOSIS_API_URL;
    return this.httpClient.post<any>(href, diagnosis);
  }

  getInProgressPatient() {
    const href = `${environment.PATIENT_DIAGNOSIS_API_URL}/in-progress-patient`;
    return this.httpClient.get<any>(href);
  }

  updatePatientDiagnosis(diagnosis: any): Observable<any> {
    const href = environment.PATIENT_DIAGNOSIS_API_URL;
    return this.httpClient.put<any>(href, diagnosis);
  }
}

export interface ProductApi {
  items: Products[];
  totalCount: number;
}

export interface Products {
  productHistoryId: number;
  productId: number;
  brandId: number;
  brandName: string;
  productName: string;
  unit: string;
  lotNumber: string;
  qtyOnHand: number;
  sellingPrice: number;
  expiryDate: string;
  dosage: string;
}

export interface PatientDiagnosis {
  patientId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: string;
  birthDate: string;
  address: string;
  consultationId: number;
  weight: number;
  height: number;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  consultationDate: string;
  consultationStatus: string;
  visitType: string;
}

export interface Prescription {
  productHistoryId: number;
  productId: number;
  brandId: number;
  brandName: string;
  productName: string;
  unit: string;
  lotNumber: string;
  quantity: number;
  sellingPrice: number;
  expiryDate: string;
  dosage: string;
  instructions: string;
}

export interface MedicalHistoryApi {
  patientVisits: PatientVisits[];
  patientPrescriptionsList: PatientPrescriptionList[];
}

export interface PatientVisits {
  diagnosisId: number;
  visitId: number;
  patientId: number;
  visitDateTime: string;
  age: number;
  ageType: string;
  height: number;
  weight: number;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  followup: string;
  diagnosis: string;
  remarks: string;
  patientComplaintsNotes: string;
  visitType: string;
  visitStatus: string;
}

export interface PatientPrescriptionList {
  prescriptionId: number;
  patientId: number;
  visitId: number;
  diagnosisId: number;
  productHistoryId: number;
  brandName: string;
  productId: number;
  productName: string;
  quantity: number;
  dosage: string;
  instructions: string;
}
