import { TestBed } from '@angular/core/testing';

import { StockReceivingService } from './stock-receiving.service';

describe('StockReceivingService', () => {
  let service: StockReceivingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockReceivingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
