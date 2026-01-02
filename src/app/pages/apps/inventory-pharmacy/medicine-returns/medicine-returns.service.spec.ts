import { TestBed } from '@angular/core/testing';

import { MedicineReturnsService } from './medicine-returns.service';

describe('MedicineReturnsService', () => {
  let service: MedicineReturnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicineReturnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
