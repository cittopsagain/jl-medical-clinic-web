import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService {

  private patientRecordMedicalHistoryPatientVisitBehaviorSubject = new BehaviorSubject<any | null>(null);
  patientRecordMedicalHistoryPatientVisitObservable$ = this.patientRecordMedicalHistoryPatientVisitBehaviorSubject.asObservable();

  clearPatientVisit(patientId: number) {
    this.patientRecordMedicalHistoryPatientVisitBehaviorSubject.next(patientId);
  }
}
