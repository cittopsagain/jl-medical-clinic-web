import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private itemsSubject = new BehaviorSubject<any | null>(null);
  items$ = this.itemsSubject.asObservable();

  setItems(items: any) {
    this.itemsSubject.next(items); // notify subscribers
  }
}
