import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EditPatientConsultationService {

  private editPatientConsultationVisitIdBehaviorSubject = new BehaviorSubject<any | null>(null);
  editPatientConsultationVisitIdObservable$ = this.editPatientConsultationVisitIdBehaviorSubject.asObservable();

  setVisitId(visitId: number) {
    this.editPatientConsultationVisitIdBehaviorSubject.next(visitId);
  }

}
