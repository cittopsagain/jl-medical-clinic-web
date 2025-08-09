import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPatientConsultationComponent } from './add-patient-consultation.component';

describe('AddPatientConsultationComponent', () => {
  let component: AddPatientConsultationComponent;
  let fixture: ComponentFixture<AddPatientConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPatientConsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPatientConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
