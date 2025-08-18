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

    const href = environment.POS_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=${this.limit}&productName=${encodeURIComponent(search.productName)}`;

    return this.httpClient.get<ProductApi>(requestUrl);
  }

  savePurchasedProducts(purchasedProducts: any): Observable<any> {
    console.log(purchasedProducts);
    const href = environment.POS_API_URL;
    return this.httpClient.post<any>(href, purchasedProducts);
  }

}

export interface ProductApi {
  items: Products[];
  totalCount: number;
}

export interface Products {
  productId: number;
  brandId: number;
  brandName: string;
  productName: string;
  qtyOnHand: number;
  sellingPrice: number;
  expiryDate: string;
}

export interface PurchasedProducts {
  productId: number;
  brandId: number;
  brandName: string;
  productName: string;
  qty: number;
  sellingPrice: number;
  totalAmount: number;
  expiryDate: string;
}
