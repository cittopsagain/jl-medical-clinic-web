import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class StockAdjustmentService {

  private limit = 30; // Default limit for pagination

  constructor(private httpClient: HttpClient) { }

  getProducts(search: any,
              sort: string,
              order: string,
              page: number): Observable<ProductApi> {
    if (search.productName == null || search.productName === undefined) {
      search.productName = '';
    }

    const href = environment.STOCK_ADJUSTMENT_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=${this.limit}&productName=${encodeURIComponent(search.productName)}`;

    return this.httpClient.get<ProductApi>(requestUrl);
  }

  updateInventory(product: any): Observable<any> {
    const href = environment.STOCK_ADJUSTMENT_API_URL;
    return this.httpClient.put<any>(href, product);
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
  unit: string;
  lotNumber: string;
  qtyOnHand: number;
  sellingPrice: number;
  expiryDate: string;
}
