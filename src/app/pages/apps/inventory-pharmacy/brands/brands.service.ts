import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {Brand} from "./models/brand";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BrandsService {

  constructor(private httpClient: HttpClient) {}

  private brandRecordTabBehaviorSubject = new BehaviorSubject<any | null>(null);
  brandRecordTabBehaviorObservable$ = this.brandRecordTabBehaviorSubject.asObservable();

  setTabIndex(index: number) {
    this.brandRecordTabBehaviorSubject.next(index);
  }

  getBrands(search: any, sort: string, order: string, page: number) {
    if (search.brandName == null || search.brandName === undefined) {
      search.brandName = '';
    }

    const href = environment.BRANDS_API_URL;
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&limit=30&brandName=${encodeURIComponent(search.brandName)}`;

    return this.httpClient.get<BrandsApi>(requestUrl);
  }

  saveBrand(brand: Brand) {
    const href = environment.BRANDS_API_URL;
    return this.httpClient.post<any>(href, brand);
  }

  updateBrand(brand: Brand) {
    const href = environment.BRANDS_API_URL;
    return this.httpClient.put<any>(href, brand);
  }

  deleteBrand(brandId: number) {
    const href = environment.BRANDS_API_URL;
    return this.httpClient.delete<any>(`${href}/${brandId}`);
  }
}

export interface BrandsApi {
  items: Brands[],
  totalCount: number;
}

export interface Brands {
  brandId: number;
  brandName: string;
  reference: number;
}
