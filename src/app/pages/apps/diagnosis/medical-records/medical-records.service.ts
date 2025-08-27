import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordsService {

  constructor(private httpClient: HttpClient) { }
  private limit = 30; // Default limit for pagination

  getMedicalRecords(
    sort: string,
    order: string,
    page: number,
    patientName: string,
    address: string
  ) {
    const href = environment.MEDICAL_HISTORY_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${
      page + 1
    }&limit=${ this.limit }&patientName=${encodeURIComponent(patientName)}&address=${encodeURIComponent(address)}`;

    return this.httpClient.get<any>(requestUrl);
  }

  getMedicalCertificate(patientId: number, visitId: number) {
    const href = `${environment.PDF_API_URL}/medical-certificate/${patientId}/${visitId}`;

    return this.httpClient.get(href, {
      responseType: 'blob' // important: expect binary
    });
  }

}
