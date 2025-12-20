import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {Router} from "@angular/router";
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatSelect} from "@angular/material/select";
import {PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";

@Component({
  selector: 'app-add-patient',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatDatepickerModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatRadioButton,
    MatRadioGroup
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './add-patient.component.html',
  styleUrl: './add-patient.component.scss'
})
export class AddPatientComponent implements OnInit {
  patientForm: UntypedFormGroup | any;
  @ViewChild('lastNameInput') lastNameInput: ElementRef;
  gender: string[] = [
    'Male',
    'Female'
  ];
  visitType: string[] = ['Consultation', 'Direct Doctor Consultation', 'Direct Doctor Follow-up Checkup'];

  constructor(private fb: UntypedFormBuilder,
              private patientService: PatientRecordsService,
              private toastR: ToastrService,
              private router: Router
  ) {
    this.patientForm = this.fb.group({
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ\\s\'\-]+$')]],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ\\s\'\\-\\.]+$')]],
      middleName: ['', Validators.pattern('^[a-zA-Z\\s\'\-]+$')],
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      sex: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      markForConsultation: [1],
      visitType: ['', Validators.required],
    });
  }

  ngOnInit() {
    const savedData: any = sessionStorage.getItem("PATIENT_RECORD_ADD_PATIENT_SESSION_STORAGE");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      this.patientForm.patchValue(parsed.formValue);
    }

    this.patientForm.valueChanges.subscribe((formValue: any) => {
      const dataToStore: {formValue: any, timestamp: number} = {
        formValue: formValue,
        timestamp: Date.now()
      };
      sessionStorage.setItem('PATIENT_RECORD_ADD_PATIENT_SESSION_STORAGE', JSON.stringify(dataToStore));
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.lastNameInput) {
        this.lastNameInput.nativeElement.focus();
      }
    });
  }

  savePatient(event: Event) {
    if (this.patientForm.valid) {
      this.patientService.savePatientRecord(this.patientForm.value)
        .subscribe({
          next: (response: any) => {
            this.toastR.success(response.message, 'Success');
            sessionStorage.removeItem("PATIENT_RECORD_ADD_PATIENT_SESSION_STORAGE");

            // Clear related session storage items
            sessionStorage.removeItem('PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE')
            sessionStorage.removeItem('PATIENT_CONSULTATION_EDIT_PATIENT_CONSULTATION_VITAL_SIGNS_SESSION_STORAGE');

            if (this.patientForm.value.visitType != null &&
              this.patientForm.value.visitType != '' &&
              this.patientForm.value.visitType != 'Direct Doctor Consultation' &&
              this.patientForm.value.visitType != 'Direct Doctor Follow-up Checkup') {
              this.patientForm.reset();
              this.router.navigate(
                ['/apps/patient-management/patient-consultation/1'],
                { queryParams: { visit_id: response.data.consultationId } }
              )
            } else {
              this.patientForm.reset();
              this.patientService.setTabIndex(0);
            }
          },
          error: (error) => {
            this.toastR.error(error.error.message, 'Error');
          }
        });
    } else {
      this.toastR.error('Please fill out all required fields correctly.', 'Error');
    }
  }
}
