import {ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {PatientRecords, PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {DatePipe} from "@angular/common";
import {MatOption, provideNativeDateAdapter} from "@angular/material/core";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatSelect} from "@angular/material/select";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-edit-patient',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    RouterLink,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    DatePipe,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatOption,
    MatSelect,
    MatCheckbox
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './edit-patient.component.html',
  styleUrl: './edit-patient.component.scss'
})
export class EditPatientComponent {
  patientForm: UntypedFormGroup | any;
  patientRecord: PatientRecords;
  @ViewChild('lastNameInput') lastNameInput: ElementRef;
  gender: string[] = [
    'Male',
    'Female'
  ];

  constructor(private patientRecordsService: PatientRecordsService, private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef,
              private patientService: PatientRecordsService, private toastr: ToastrService, private route: ActivatedRoute,
              private router: Router) {
    this.patientForm = this.fb.group({
      patientId: '',
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: '',
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      sex: ['', Validators.required],
      markForConsultation: [0]
    });

    const id: number = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.patientForm.patientId = id;
      this.patientRecordsService.getPatientRecordById(id).subscribe({
        next: (data: PatientRecords) => {
          this.patientRecord = data;

          let sex = '';
          if (data.sex == 'Male') {
            sex = 'M';
          }
          if (data.sex == 'Female') {
            sex = 'F';
          }

          this.patientForm.patchValue({
            patientId: data.patientId,
            lastName: data.lastName,
            firstName: data.firstName,
            middleName: data.middleName,
            address: data.address,
            birthDate: data.birthDate,
            sex: sex,
            markForConsultation: data.markForConsultation
          });
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Oops!');
        }
      });
    }
  }

  ngAfterViewInit() {
    // Delay focus to avoid ExpressionChangedAfterItHasBeenChecked error
    setTimeout(() => {
      if (this.lastNameInput) {
        this.lastNameInput.nativeElement.focus();
      }
    });
  }

  updatePatient(event: Event) {
    this.patientForm.value.markForConsultation = this.patientForm.value.markForConsultation === true ? 1 : 0;

    this.patientService.updatePatientRecord(this.patientForm.value).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message, 'Success!');
        this.patientForm.reset();
        this.router.navigate(['/apps/patient-management/patient-records']);
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Oops!');
      }
    })
  }
}
