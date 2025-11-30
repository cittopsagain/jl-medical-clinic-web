import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ViewPatientService {

  private viewPatientPatientIdBehaviorSubject = new BehaviorSubject<any | null>(null);
  viewPatientPatientIdObservable$ = this.viewPatientPatientIdBehaviorSubject.asObservable();

  setPatientId(patientId: number) {
    this.viewPatientPatientIdBehaviorSubject.next(patientId);
  }
}
