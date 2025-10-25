import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {PatientRecordsApi} from "../../patient-management/patient-records/patient-records.service";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PosService {

  private limit = 30; // Default limit for pagination

  constructor(private httpClient: HttpClient) { }

  getProducts(search: any,
              sort: string,
              order: string,
              page: number): Observable<ProductApi> {
    if (search.productName == null || search.productName === undefined) {
      search.productName = '';
    }

    if (search.filterBy == null || search.filterBy === undefined) {
      search.filterBy = '';
    }

    const href = environment.POS_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=${this.limit}&productName=${encodeURIComponent(search.productName)}&filterBy=${encodeURIComponent(search.filterBy)}`;

    return this.httpClient.get<ProductApi>(requestUrl);
  }

  savePurchasedProducts(purchasedProducts: any): Observable<any> {
    const href = environment.POS_API_URL;
    return this.httpClient.post<any>(href, purchasedProducts);
  }

  getTodaysSales() {
    const href = `${environment.POS_API_URL}/sales/today`;
    return this.httpClient.get<any>(href);
  }

  getReceipt(posId: number) {
    const href = `${environment.PDF_API_URL}/pharmacy/sales/${posId}`;

    return this.httpClient.get(href, {
      responseType: 'blob' // important: expect binary
    });
  }

  getPatientRecord(search: any,
                   sort: string,
                   order: string,
                   page: number): Observable<PatientApi> {
    {
      if (search.search == null || search.search === undefined) {
        search.search = '';
      }

      if (search.filterBy == null || search.filterBy === undefined) {
        search.filterBy = '';
      }

      const href = `${environment.POS_API_URL}/patient-record`;
      const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=10&search=${encodeURIComponent(search.search)}&filterBy=${encodeURIComponent(search.filterBy)}`;

      return this.httpClient.get<PatientApi>(requestUrl);
    }
  }

  getPatientsTransactions(search: any,
                               sort: string,
                               order: string,
                               page: number): Observable<PatientApi> {
    {
      if (search.search == null || search.search === undefined) {
        search.search = '';
      }

      if (search.filterBy == null || search.filterBy === undefined) {
        search.filterBy = '';
      }

      const href = `${environment.POS_API_URL}/patients-transactions`;
      const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=${this.limit}&search=${encodeURIComponent(search.search)}&filterBy=${encodeURIComponent(search.filterBy)}`;

      return this.httpClient.get<PatientApi>(requestUrl);
    }
  }

  getPurchaseDetail(posId: number) {
    const href = `${environment.POS_API_URL}/purchase-detail/${posId}`;
    return this.httpClient.get<any>(href);
  }
}

export interface ProductApi {
  items: Products[];
  totalCount: number;
}

export interface Products {
  productHistoryId: number;
  productId: number;
  brandId: number;
  brandName: string;
  productName: string;
  lotNumber: string;
  qtyOnHand: number;
  sellingPrice: number;
  expiryDate: string;
  unit: string;
}

export interface PurchasedProducts {
  productHistoryId: number;
  productId: number;
  brandId: number;
  brandName: string;
  productName: string;
  qty: number;
  sellingPrice: number;
  totalAmount: number;
  expiryDate: string;
}

export interface PatientApi {
  items: Patient[];
  totalCount: number;
}

export interface Patient {
  posId: number;
  patientId: number;
  patientDiagnosisId: number;
  patientName: string;
  address: string;
  contactNumber: string;
  visitId: number;
  visitDate: string;
  visitType: string;
  dateCreated: string;
  customerOrderType: string;
  totalAmountDue: number;
}
