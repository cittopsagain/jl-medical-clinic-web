import { TestBed } from '@angular/core/testing';

import { PatientConsultationService } from './patient-consultation.service';

describe('PatientConsultationService', () => {
  let service: PatientConsultationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientConsultationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
