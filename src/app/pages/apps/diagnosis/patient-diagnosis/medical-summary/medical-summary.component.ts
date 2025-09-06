import {Component, OnInit} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";

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

  diagnosisForm!: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.diagnosisForm = this.fb.group({
      patientComplaintsNotes: [''],
      diagnosis: ['', Validators.required],
      followUpCheckupRemarks: ['Follow-up check up / Remarks'],
      remarksForMedicalCertificate: [''],
    });
  }

  ngAfterViewInit() {

  }
}
