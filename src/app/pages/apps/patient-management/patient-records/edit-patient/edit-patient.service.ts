import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EditPatientService {

  private editPatientPatientIdBehaviorSubject = new BehaviorSubject<{patientId: any | null, reQuery: boolean}>({patientId: null, reQuery: true});
  editPatientPatientIdObservable$ = this.editPatientPatientIdBehaviorSubject.asObservable();

  setPatientId(patientId: number, reQuery: boolean = true) {
    this.editPatientPatientIdBehaviorSubject.next({patientId, reQuery});
  }
}
