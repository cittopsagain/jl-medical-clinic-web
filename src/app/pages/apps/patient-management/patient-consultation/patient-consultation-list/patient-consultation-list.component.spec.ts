import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConsultationListComponent } from './patient-consultation-list.component';

describe('PatientConsultationListComponent', () => {
  let component: PatientConsultationListComponent;
  let fixture: ComponentFixture<PatientConsultationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientConsultationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientConsultationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
