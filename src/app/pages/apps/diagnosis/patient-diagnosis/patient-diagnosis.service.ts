import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PatientDiagnosisService {

  constructor(private httpClient: HttpClient) { }

  getPatientDiagnosis(): Observable<PatientDiagnosis> {
    const href = environment.PATIENT_DIAGNOSIS_API_URL;
    return this.httpClient.get<PatientDiagnosis>(href);
  }

  getMedicines(medicineName: string) : Observable<Medicine[]> {
    const href = `${environment.PATIENT_DIAGNOSIS_API_URL}/medicines/${encodeURIComponent(medicineName)}`;
    return this.httpClient.get<Medicine[]>(href);
  }

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
}

export interface Medicine {
  medicineId: number;
  medicineName: string;
  diagnosis: string;
}
