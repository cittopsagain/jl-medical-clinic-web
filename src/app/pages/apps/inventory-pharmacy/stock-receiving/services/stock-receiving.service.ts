import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StockReceivingService {

  private limit = 30; // Default limit for pagination

  constructor(private httpClient: HttpClient) { }

  getStockReceivingHeader(
    search: any,
    sort: string,
    order: string,
    page: number
  ): Observable<HeaderApi> {
    if (search.supplierName == null || search.supplierName === undefined) {
      search.supplierName = '';
    }

    const href = environment.STOCK_RECEIVING_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=${this.limit}&supplierName=${encodeURIComponent(search.supplierName)}`;

    return this.httpClient.get<HeaderApi>(requestUrl);
  }

  getAgents() {
    const href = `${environment.STOCK_RECEIVING_API_URL}/agents`;
    return this.httpClient.get<any>(href);
  }

  saveStocks(stocks: any) {
    const href = environment.STOCK_RECEIVING_API_URL;

    return this.httpClient.post<any>(href, stocks);
  }

  getStockReceivingByPurchaseId(purchaseId: number) {
    const href = `${environment.STOCK_RECEIVING_API_URL}/stocks/${purchaseId}`;
    return this.httpClient.get<any>(href);
  }
}

export interface HeaderApi {
  items: Header[];
  totalCount: number;
}

export interface Header {
  purchaseId: number;
  invoiceNumber: number;
  invoiceDate: string;
  supplierName: string;
  dateTimeCreated: string;
}
