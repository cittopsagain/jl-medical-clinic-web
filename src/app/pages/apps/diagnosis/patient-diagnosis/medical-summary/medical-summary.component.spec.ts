import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSummaryComponent } from './medical-summary.component';

describe('MedicalSummaryComponent', () => {
  let component: MedicalSummaryComponent;
  let fixture: ComponentFixture<MedicalSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
