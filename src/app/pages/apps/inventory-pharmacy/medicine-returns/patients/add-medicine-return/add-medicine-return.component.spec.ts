import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMedicineReturnComponent } from './add-medicine-return.component';

describe('AddMedicineReturnComponent', () => {
  let component: AddMedicineReturnComponent;
  let fixture: ComponentFixture<AddMedicineReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMedicineReturnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMedicineReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
