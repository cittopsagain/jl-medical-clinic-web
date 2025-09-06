import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordsService {

  constructor(private httpClient: HttpClient) { }
  private limit = 30; // Default limit for pagination

  getPatientRecords(
    sort: string,
    order: string,
    page: number,
    patientName: string,
    address: string
  ) {
    const href = environment.MEDICAL_HISTORY_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${
      page + 1
    }&limit=${ this.limit }&patientName=${encodeURIComponent(patientName)}&address=${encodeURIComponent(address)}`;

    return this.httpClient.get<PatientRecordsApi>(requestUrl);
  }

  getMedicalRecords(patientId: number) {
    const href = `${environment.MEDICAL_HISTORY_API_URL}/${patientId}`;
    return this.httpClient.get<MedicalRecordsApi>(href);
  }

  getMedicalCertificate(patientId: number, visitId: number) {
    const href = `${environment.PDF_API_URL}/medical-certificate/${patientId}/${visitId}`;

    return this.httpClient.get(href, {
      responseType: 'blob' // important: expect binary
    });
  }

  getPrescription(patientId: number, visitId: number) {
    const href = `${environment.PDF_API_URL}/prescription/${patientId}/${visitId}`;

    return this.httpClient.get(href, {
      responseType: 'blob' // important: expect binary
    });
  }

  updatePatientVisitRemarks(patientId: number, visitId: number, remarks: string) {
    const href = `${environment.MEDICAL_HISTORY_API_URL}/${patientId}/${visitId}`;
    return this.httpClient.put<any>(href, { remarks });
  }
}

export interface PatientRecordsApi {
  items: Patient[];
  totalCount: number;
}

export interface MedicalRecordsApi {
  medicalRecords: MedicalRecords[];
  prescription: Prescription[];
}

export interface Patient extends Visits {
  patientId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  address: string;
  contactNumber: string;
  gender: string
  birthDate: string;
}

export interface Visits {
  visitId: number;
  visitType: string;
  patientId: number;
  visitDateTime: string;
  age: number;
  ageType: number;
  visitCount: number;
}

export interface VitalSigns {
  patientId: number;
  visitId: number;
  height: number;
  weight: number;
  temperature: number;
  bloodPressure: number;
  heartRate: number;
  oxygenSaturation: number;
}

export interface Diagnosis {
  patientId: number;
  visitId: number;
  patientComplaintsNotes: string;
  followup: string;
  diagnosis: string;
  remarks: string;
}

export interface MedicalRecords {
  visits: Visits[];
  vitalSigns: VitalSigns[];
  diagnosis: Diagnosis[];
}

export interface Prescription {
  patientId: number;
  visitId: number;
  prescriptionId: number;
  diagnosisId: number;
  productId: number;
  productHistoryId: number;
  productName: string;
  brandName: string;
  unit: string;
  quantity: number;
  dosage: string;
  instructions: string;
}
