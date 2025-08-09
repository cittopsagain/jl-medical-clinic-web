import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PatientRecordsService {

  private limit = 30; // Default limit for pagination

  constructor(private httpClient: HttpClient) {}

  getPatientRecords(
    search: any,
    sort: string,
    order: string,
    page: number): Observable<PatientRecordsApi> {
    if (search.patientName == null || search.patientName === undefined) {
      search.patientName = '';
    }

    if (search.address == null || search.address === undefined) {
      search.address = '';
    }

    const href = environment.PATIENT_RECORD_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${
      page + 1
    }&limit=${ this.limit }&patientName=${encodeURIComponent(search.patientName)}&address=${encodeURIComponent(search.address)}`;

    return this.httpClient.get<PatientRecordsApi>(requestUrl);
  }

  savePatientRecord(patientRecord: PatientRecords): Observable<PatientRecords> {
    const href = environment.PATIENT_RECORD_API_URL;
    return this.httpClient.post<PatientRecords>(href, patientRecord);
  }

  getPatientRecordById(patientId: number): Observable<PatientRecords> {
    const href = environment.PATIENT_RECORD_API_URL + '/by-patient-id/' + patientId;
    return this.httpClient.get<PatientRecords>(href);
  }

  deletePatientRecord(patientId: number): Observable<any> {
    const href = environment.PATIENT_RECORD_API_URL + '/' + patientId;
    return this.httpClient.delete<any>(href);
  }

  updatePatientRecord(patientRecord: PatientRecords): Observable<PatientRecords> {
    const href = environment.PATIENT_RECORD_API_URL;
    return this.httpClient.put<PatientRecords>(href, patientRecord);
  }

}

export interface  PatientRecordsApi {
  items: PatientRecords[];
  totalCount: number;
}

export interface PatientRecords {
  patientId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: string;
  birthDate: string;
  address: string;
  createdBy: string;
  dateCreated: string;
  modifiedBy: string;
  dateModified: string;
  reference: number,
  markForConsultation: number
}
