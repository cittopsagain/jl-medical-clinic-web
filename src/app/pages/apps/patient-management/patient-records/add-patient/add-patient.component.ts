import {ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {DatePipe} from "@angular/common";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {MatFormField, MatHint, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {Router, RouterLink} from "@angular/router";
import {TablerIconComponent} from "angular-tabler-icons";
import {DateAdapter, MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatSelect} from "@angular/material/select";
import {PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-add-patient',
  // standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatIconButton,
    MatInput,
    MatLabel,
    RouterLink,
    TablerIconComponent,
    MatDatepickerModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatHint,
    MatSuffix,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatCheckbox
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './add-patient.component.html',
  styleUrl: './add-patient.component.scss'
})
export class AddPatientComponent {
  patientForm: UntypedFormGroup | any;
  @ViewChild('lastNameInput') lastNameInput: ElementRef;
  gender: string[] = [
    'Male',
    'Female'
  ];

  constructor(private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef,
              private patientService: PatientRecordsService, private toastr: ToastrService,
              private router: Router) {
    this.patientForm = this.fb.group({
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ\\s\'\-]+$')]],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑ\\s\'\\-\\.]+$')]],
      middleName: ['', Validators.pattern('^[a-zA-Z\\s\'\-]+$')],
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      sex: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      markForConsultation: [1] // Initialize with 1 (checked)
    });
  }

  ngOnInit() {
    /*setTimeout(() => {
      this.cdr.detectChanges();
    });*/
  }

  ngAfterViewInit() {
    // Delay focus to avoid ExpressionChangedAfterItHasBeenChecked error
    setTimeout(() => {
      if (this.lastNameInput) {
        this.lastNameInput.nativeElement.focus();
      }
    });
  }

  savePatient(event: Event) {
    if (this.patientForm.valid) {
      if (this.patientForm.value.markForConsultation == false) {
        this.patientForm.value.markForConsultation = 0; // Unchecked
      }

      this.patientService.savePatientRecord(this.patientForm.value)
        .subscribe({
          next: (response: any) => {
            this.toastr.success(response.message, 'Success');
            // this.patientForm.reset();
            if (response.data.consultationId != null && response.data.consultationId != undefined
            && this.patientForm.value.markForConsultation == 1) {
              // If consultationId is present, navigate to the consultation page
              this.router.navigate(['/apps/patient-management/patient-consultation/edit-patient-for-consultation', response.data.consultationId]);
            } else {
              this.router.navigate(['/apps/patient-management/patient-records']);
            }
          },
          error: (error) => {
            this.toastr.error(error.error.message, 'Error');
          }
        });
    } else {
      // Mark form controls as touched to display validation errors
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key).markAsTouched();
      });
    }
  }

}
