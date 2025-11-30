import { TestBed } from '@angular/core/testing';

import { PatientInformationService } from './patient-information.service';

describe('PatientInformationService', () => {
  let service: PatientInformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientInformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
