import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStockReceivingComponent } from './view-stock-receiving.component';

describe('ViewStockReceivingComponent', () => {
  let component: ViewStockReceivingComponent;
  let fixture: ComponentFixture<ViewStockReceivingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStockReceivingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStockReceivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
