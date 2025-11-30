import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PatientInformationService {

  private medicalRecordsEditViewMedicalRecordPatientIdBehaviorSubject = new BehaviorSubject<any | null>(null);
  medicalRecordsEditViewMedicalRecordPatientIdObservable$ = this.medicalRecordsEditViewMedicalRecordPatientIdBehaviorSubject.asObservable();

  setPatientId(patientId: string) {
    this.medicalRecordsEditViewMedicalRecordPatientIdBehaviorSubject.next(patientId);
  }
}
