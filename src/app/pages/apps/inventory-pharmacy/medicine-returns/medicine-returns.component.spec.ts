import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineReturnsComponent } from './medicine-returns.component';

describe('MedicineReturnsComponent', () => {
  let component: MedicineReturnsComponent;
  let fixture: ComponentFixture<MedicineReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineReturnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
