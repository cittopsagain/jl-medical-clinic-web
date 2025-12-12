import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../../environments/environment";
import {MedicineApi} from "./models/medicine";

@Injectable({
  providedIn: 'root'
})
export class MedicineService {

  private limit = 30; // Default limit for pagination

  constructor(private httpClient: HttpClient) {}

  getMedicine(search: any,
              sort: string,
              order: string,
              page: number): Observable<MedicineApi> {

    if (search.medicineName == null || search.medicineName === undefined) {
      search.medicineName = '';
    }

    const href = environment.MEDICINE_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=${this.limit}&search=${encodeURIComponent(search.medicineName)}&filterBy=${encodeURIComponent(search.filterBy)}`;

    return this.httpClient.get<MedicineApi>(requestUrl);
  }

  getBrands() {
    const href = `${environment.MEDICINE_API_URL}/brands`;
    return this.httpClient.get<any>(href);
  }

  saveMedicine(medicine: any) {
    const href = `${environment.MEDICINE_API_URL}`;
    return this.httpClient.post<any>(href, medicine);
  }

  updateMedicine(medicine: any) {
    const href = `${environment.MEDICINE_API_URL}`;
    return this.httpClient.put<any>(href, medicine);
  }
}
