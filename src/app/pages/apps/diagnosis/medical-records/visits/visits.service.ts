import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class VisitsService {
  private visitsSubject = new BehaviorSubject<any | null>(null);
  patientId$ = this.visitsSubject.asObservable();

  setPatientId(patientId: any) {
    localStorage.setItem('patientId', patientId);
    this.visitsSubject.next(patientId); // notify subscribers
  }

  clearLocalStorage() {
    localStorage.removeItem('patientId');
  }
}
