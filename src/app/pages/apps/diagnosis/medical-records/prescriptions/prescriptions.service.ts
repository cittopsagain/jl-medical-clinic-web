import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PrescriptionsService {

  constructor(private httpClient: HttpClient) { }

  private prescriptionsSubject = new BehaviorSubject<any | null>(null);
  prescriptions$ = this.prescriptionsSubject.asObservable();

  private prescriptionPatientIdAndVisitIdBehaviorSubject = new BehaviorSubject<{patientId: any | null, visitId: any | null}>({patientId: null, visitId: null});
  prescriptionPatientIdAndVisitIdObservable$ = this.prescriptionPatientIdAndVisitIdBehaviorSubject.asObservable();

  setPatientIdAndVisitId(patientId: number, visitId: number) {
    this.prescriptionPatientIdAndVisitIdBehaviorSubject.next({patientId, visitId});
  }

  setPrescriptions(prescriptions: any) {
    sessionStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    this.prescriptionsSubject.next(prescriptions); // notify subscribers
  }

  getPrescriptions(patientId: number, visitId: number, diagnosisId: number) {
    const href = `${environment.MEDICAL_HISTORY_API_URL}/prescription/${patientId}/${visitId}/${diagnosisId}`;
    return this.httpClient.get<any>(href);
  }

  addAdditionalPrescription(prescription: any) {
    const href = `${environment.PATIENT_DIAGNOSIS_API_URL}/prescription`;
    return this.httpClient.put<any>(href, prescription);
  }

  updatePrescription(prescription: any) {
    const href = `${environment.MEDICAL_HISTORY_API_URL}/update-prescription/${prescription.patientId}/${prescription.prescriptionId}`;
    return this.httpClient.put<any>(href, prescription);
  }

  deletePrescription(prescriptionId: number, nonStock: number) {
    const href = `${environment.MEDICAL_HISTORY_API_URL}/${prescriptionId}`;
    return this.httpClient.delete<any>(href, {
      params: { nonstock: nonStock.toString() }
    });
  }
}
