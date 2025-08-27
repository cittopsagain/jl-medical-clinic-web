import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisAndMedicalRecordsComponent } from './diagnosis-and-medical-records.component';

describe('DiagnosisAndMedicalRecordsComponent', () => {
  let component: DiagnosisAndMedicalRecordsComponent;
  let fixture: ComponentFixture<DiagnosisAndMedicalRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosisAndMedicalRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosisAndMedicalRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
