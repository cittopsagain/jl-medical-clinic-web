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

  setPrescriptions(prescriptions: any) {
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    this.prescriptionsSubject.next(prescriptions); // notify subscribers
  }

  getPrescriptions() {
    const stored = localStorage.getItem('prescriptions');
    return stored ? JSON.parse(stored) : null;
  }

  updatePrescription(prescription: any) {
    const href = `${environment.PATIENT_DIAGNOSIS_API_URL}/prescription`;
    return this.httpClient.put<any>(href, prescription);
  }
}
