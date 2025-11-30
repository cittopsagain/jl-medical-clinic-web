import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VitalSignsService {
  private vitalSignsSubject = new BehaviorSubject<any | null>(null);
  vitalSigns$ = this.vitalSignsSubject.asObservable();

  setVitalSigns(vitalSigns: any) {
    this.vitalSignsSubject.next(vitalSigns); // notify subscribers
  }

  getVitalSigns() {
    const stored = sessionStorage.getItem('vitalSigns');
    return stored ? JSON.parse(stored) : null;
  }
}
