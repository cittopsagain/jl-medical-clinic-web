import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PrescriptionsService {
  private prescriptionsSubject = new BehaviorSubject<any | null>(null);
  prescriptions$ = this.prescriptionsSubject.asObservable();

  setPrescriptions(prescriptions: any) {
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    this.prescriptionsSubject.next(prescriptions); // notify subscribers
  }

  getPrescriptions() {
    const stored = localStorage.getItem('prescriptions');
    return stored ? JSON.parse(stored) : null;
  }
}
