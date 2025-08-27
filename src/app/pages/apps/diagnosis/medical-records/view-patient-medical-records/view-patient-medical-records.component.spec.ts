import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPatientMedicalRecordsComponent } from './view-patient-medical-records.component';

describe('ViewPatientMedicalRecordsComponent', () => {
  let component: ViewPatientMedicalRecordsComponent;
  let fixture: ComponentFixture<ViewPatientMedicalRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPatientMedicalRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPatientMedicalRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
