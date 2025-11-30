import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ViewPatientMedicalRecordsService {

  private viewPatientMedicalRecordBehaviorSubject = new BehaviorSubject<{patientId: any | null, visitId: any | null, visitDate: any | null}>({patientId: null, visitId: null, visitDate: null});
  viewPatientMedicalRecordObservable$ = this.viewPatientMedicalRecordBehaviorSubject.asObservable();

  setTabDetails(patientId: number, visitId: number, visitDate: string) {
    this.viewPatientMedicalRecordBehaviorSubject.next({patientId, visitId, visitDate});
  }


}
