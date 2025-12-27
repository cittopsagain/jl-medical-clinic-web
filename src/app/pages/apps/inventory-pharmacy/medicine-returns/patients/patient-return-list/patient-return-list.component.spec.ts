import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReturnListComponent } from './patient-return-list.component';

describe('PatientReturnListComponent', () => {
  let component: PatientReturnListComponent;
  let fixture: ComponentFixture<PatientReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientReturnListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
