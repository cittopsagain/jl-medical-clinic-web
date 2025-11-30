import { TestBed } from '@angular/core/testing';

import { EditPatientConsultationService } from './edit-patient-consultation.service';

describe('EditPatientConsultationService', () => {
  let service: EditPatientConsultationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditPatientConsultationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
