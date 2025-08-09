import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPatientConsultationComponent } from './edit-patient-consultation.component';

describe('EditPatientConsultationComponent', () => {
  let component: EditPatientConsultationComponent;
  let fixture: ComponentFixture<EditPatientConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPatientConsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPatientConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
