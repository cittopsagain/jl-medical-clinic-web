import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockReceivingListComponent } from './stock-receiving-list.component';

describe('StockReceivingListComponent', () => {
  let component: StockReceivingListComponent;
  let fixture: ComponentFixture<StockReceivingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockReceivingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockReceivingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
