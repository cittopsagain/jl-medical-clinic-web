import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor() {
  }

  private patientMedicineReturnTabBehaviorSubject = new BehaviorSubject<any | null>(null);
  patientMedicineReturnTabBehaviorObservable$ = this.patientMedicineReturnTabBehaviorSubject.asObservable();

  setTabIndex(index: number) {
    this.patientMedicineReturnTabBehaviorSubject.next(index);
  }
}
