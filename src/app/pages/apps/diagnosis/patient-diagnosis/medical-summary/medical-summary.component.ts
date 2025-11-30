import {Component, OnInit} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-medical-summary',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    FormsModule
  ],
  templateUrl: './medical-summary.component.html',
  styleUrl: './medical-summary.component.scss'
})
export class MedicalSummaryComponent implements OnInit {

  diagnosisForm: UntypedFormGroup | any;

  constructor(private fb: FormBuilder) {
    this.diagnosisForm = this.fb.group({
      patientComplaintsNotes: [''],
      diagnosis: ['', Validators.required],
      followUpCheckupRemarks: ['Follow up on 7th day if symptoms persists'],
      remarksForMedicalCertificate: [''],
    });
  }

  ngOnInit() {
    // Load saved data FIRST
    const savedData = sessionStorage.getItem('DIAGNOSIS_MEDICAL_SUMMARY_SESSION_STORAGE');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.diagnosisForm.patchValue(parsedData, { emitEvent: false });
    }

    // Subscribe to changes AFTER loading saved data
    this.diagnosisForm.valueChanges.subscribe((formValue: any) => {
      sessionStorage.setItem('DIAGNOSIS_MEDICAL_SUMMARY_SESSION_STORAGE', JSON.stringify(formValue));
    });
  }

  ngAfterViewInit() {

  }
}
