import { TestBed } from '@angular/core/testing';

import { PatientDiagnosisService } from './patient-diagnosis.service';

describe('PatientDiagnosisService', () => {
  let service: PatientDiagnosisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientDiagnosisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
