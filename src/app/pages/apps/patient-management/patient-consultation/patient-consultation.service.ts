import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PatientConsultationService {

  constructor(private httpClient: HttpClient) { }

  private patientConsultationTabBehaviorSubject = new BehaviorSubject<any | null>(null);
  patientConsultationTabBehaviorObservable$ = this.patientConsultationTabBehaviorSubject.asObservable();

  setTabIndex(index: number) {
    this.patientConsultationTabBehaviorSubject.next(index);
  }

  getPatientConsultation(search: any) {
    let params = new HttpParams();

    const href = `${environment.PATIENT_CONSULTATION_API_URL}?search=${search.search}&filterBy=${search.filterBy}&status=${search.status}`;
    return this.httpClient.get<PatientConsultation>(href);
  }

  getPatientConsultationById(consultationId: number): Observable<PatientConsultation> {
    const href = `${environment.PATIENT_CONSULTATION_API_URL}/by-consultation-id/${consultationId}`;

    return this.httpClient.get<PatientConsultation>(href);
  }

  updatePatientConsultation(patientConsultation: PatientConsultation): Observable<PatientConsultation> {
    const href = environment.PATIENT_CONSULTATION_API_URL;

    return this.httpClient.put<PatientConsultation>(href, patientConsultation);
  }
}

export interface PatientConsultation {
  patientId: number;
  consultationId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: string;
  birthDate: string;
  address: string;
  contactNumber: string;
  status: string;
  consultationDate: string;
  weight: number;
  height: number;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  inProgressStatusCount: number;
  visitType: string;
  pendingVisitsToday: number;
}
