import { TestBed } from '@angular/core/testing';

import { ViewPatientMedicalRecordsService } from './view-patient-medical-records.service';

describe('ViewPatientMedicalRecordsService', () => {
  let service: ViewPatientMedicalRecordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewPatientMedicalRecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
