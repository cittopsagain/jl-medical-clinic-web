import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionPurchasesComponent } from './prescription-purchases.component';

describe('PrescriptionPurchasesComponent', () => {
  let component: PrescriptionPurchasesComponent;
  let fixture: ComponentFixture<PrescriptionPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionPurchasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescriptionPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
