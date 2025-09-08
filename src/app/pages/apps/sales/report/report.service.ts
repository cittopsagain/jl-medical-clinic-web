import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private httpClient: HttpClient) {
  }

  getSalesReport(dateFrom: string, dateTo: string) {
    const href = `${environment.PDF_API_URL}/sales/${dateFrom}/${dateTo}`;
    return this.httpClient.get(href, { responseType: 'blob' });
  }

  getDetailSalesReport(dateFrom: string, dateTo: string) {
    const href = `${environment.PDF_API_URL}/sales/detail/${dateFrom}/${dateTo}`;
    return this.httpClient.get(href, { responseType: 'blob' });
  }
}
