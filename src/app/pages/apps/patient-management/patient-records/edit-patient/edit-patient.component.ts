import {ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MedicalHistoryApi, PatientRecords, PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {DatePipe, NgIf} from "@angular/common";
import {MatOption, provideNativeDateAdapter} from "@angular/material/core";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatSelect} from "@angular/material/select";
import {MatCheckbox} from "@angular/material/checkbox";
import {MedicalHistoryComponent} from "../medical-history/medical-history.component";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {TablerIconComponent} from "angular-tabler-icons";
import {PrescriptionsComponent} from "../../../diagnosis/medical-records/prescriptions/prescriptions.component";
import {VisitsComponent} from "../../../diagnosis/medical-records/visits/visits.component";
import {VitalSignsService} from "../../../diagnosis/medical-records/vital-signs/vital-signs.service";
import {PrescriptionsService} from "../../../diagnosis/medical-records/prescriptions/prescriptions.service";
import {VisitsService} from "../../../diagnosis/medical-records/visits/visits.service";

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
    MatCheckbox,
    MedicalHistoryComponent,
    NgIf,
    MatRadioGroup,
    MatRadioButton,
    TablerIconComponent,
    MatCardHeader,
    MatCardTitle,
    PrescriptionsComponent,
    VisitsComponent
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

  selectedVisitType: string;
  visitType: string[] = ['Consultation', 'Follow-up Checkup'];

  constructor(private patientRecordsService: PatientRecordsService, private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef,
              private patientService: PatientRecordsService, private toastr: ToastrService, private route: ActivatedRoute,
              private router: Router, private vitalSignsService: VitalSignsService, private prescriptionService: PrescriptionsService,
              private visitsService: VisitsService) {
    this.patientForm = this.fb.group({
      patientId: '',
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: '',
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      sex: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      markForConsultation: [0],
      visitType: ['', Validators.required]
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
            // sex: sex,
            sex: data.sex,
            markForConsultation: data.markForConsultation,
            contactNumber: data.contactNumber,
            visitType: data.visitType
          });

          // this.visitsService.setPatientId(data.patientId);
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Error');
        }
      });
    }
  }

  ngAfterViewInit() {
    this.prescriptionService.setPrescriptions([]);
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
        this.toastr.success(response.message, 'Success');
        this.patientForm.reset();
        // this.router.navigate(['/apps/patient-management/patient-records']);
        this.router.navigate([
          '/apps/patient-management/patient-consultation/edit-patient-for-consultation',
          response.data
        ]);
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Error');
      }
    });
  }

  clearLocalStorage() {
    this.vitalSignsService.setVitalSigns(null);
    this.prescriptionService.setPrescriptions([]);
  }
}
