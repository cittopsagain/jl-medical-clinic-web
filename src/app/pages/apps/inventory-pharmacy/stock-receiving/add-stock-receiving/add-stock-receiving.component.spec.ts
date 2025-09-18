import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStockReceivingComponent } from './add-stock-receiving.component';

describe('AddStockReceivingComponent', () => {
  let component: AddStockReceivingComponent;
  let fixture: ComponentFixture<AddStockReceivingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStockReceivingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStockReceivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
