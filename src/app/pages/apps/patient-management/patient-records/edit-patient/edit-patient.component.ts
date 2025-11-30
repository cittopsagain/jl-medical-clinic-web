import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {PatientRecords, PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {NgIf} from "@angular/common";
import {MatOption, provideNativeDateAdapter} from "@angular/material/core";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatSelect} from "@angular/material/select";
import {MedicalHistoryComponent} from "../medical-history/medical-history.component";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {TablerIconComponent} from "angular-tabler-icons";
import {PrescriptionsService} from "../../../diagnosis/medical-records/prescriptions/prescriptions.service";
import {VisitsService} from "../../../diagnosis/medical-records/visits/visits.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {EditPatientService} from "./edit-patient.service";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-edit-patient',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatOption,
    MatSelect,
    MedicalHistoryComponent,
    NgIf,
    MatRadioGroup,
    MatRadioButton,
    TablerIconComponent,
    MatTabGroup,
    MatTab
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './edit-patient.component.html',
  styleUrl: './edit-patient.component.scss'
})
export class EditPatientComponent implements OnInit, OnDestroy {
  patientForm: UntypedFormGroup | any;
  patientRecord: PatientRecords;
  @ViewChild('lastNameInput') lastNameInput: ElementRef;
  gender: string[] = [
    'Male',
    'Female'
  ];

  selectedVisitType: string;
  visitType: string[] = ['Consultation', 'Follow-up Checkup', 'Direct Doctor Consultation', 'Direct Doctor Follow-up Checkup'];
  patientIdFromSessionStorage: number;
  private destroy$ = new Subject<void>();

  constructor(private patientRecordsService:
              PatientRecordsService,
              private fb: UntypedFormBuilder,
              private cdr: ChangeDetectorRef,
              private patientService: PatientRecordsService,
              private toastR: ToastrService,
              private prescriptionService: PrescriptionsService,
              private editPatientService: EditPatientService,
              private visitService: VisitsService,
              private router: Router
  ) {
    this.patientForm = this.fb.group({
      patientId: ['', Validators.required],
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: '',
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      sex: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      markForConsultation: [0],
      visitType: '',
      visitId: ''
    });

    this.editPatientService.editPatientPatientIdObservable$.pipe(takeUntil(this.destroy$)).subscribe(({patientId, reQuery}) => {
      if (!reQuery) {
        return;
      }
      if (patientId !== null && patientId !== undefined) {
        if (patientId !== JSON.parse(
          sessionStorage.getItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE') || '{}'
        ).patientId) {
          sessionStorage.removeItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE');
        }

        const savedData = sessionStorage.getItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE');
        let parsedSavedData: any = null;
        if (savedData) {
          parsedSavedData = JSON.parse(savedData);
        }

        this.patientForm.patientId = patientId;
        this.patientRecordsService.getPatientRecordById(patientId).subscribe({
          next: (data: PatientRecords) => {
            this.patientRecord = data;

            this.patientForm.patchValue({
              patientId: data.patientId,
              lastName: parsedSavedData?.lastName ? parsedSavedData?.lastName : data.lastName,
              firstName: parsedSavedData?.firstName ? parsedSavedData?.firstName : data.firstName,
              middleName: parsedSavedData?.middleName ? parsedSavedData?.middleName : data.middleName,
              address: parsedSavedData?.address ? parsedSavedData?.address : data.address,
              birthDate: parsedSavedData?.birthDate ? parsedSavedData?.birthDate : data.birthDate,
              sex: parsedSavedData?.sex ? parsedSavedData?.sex : data.sex,
              markForConsultation: data.markForConsultation,
              contactNumber: parsedSavedData?.contactNumber ? parsedSavedData?.contactNumber : data.contactNumber,
              visitType: data.visitStatus == 'COMPLETED' ? '' : (
                parsedSavedData?.visitType ? parsedSavedData?.visitType : data.visitType
              ),
              visitId: data.visitId
            });

            // this.visitService.setPatientId(data.patientId);

            setTimeout(() => this.cdr.detectChanges()); // ERROR Error: ASSERTION ERROR: Should be run in update mode [Expected=> false == true <=Actual]
          },
          error: (error) => {
            this.toastR.error(error.error.message, 'Error');
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const savedData = sessionStorage.getItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.patientForm.patchValue(parsedData);
      this.patientIdFromSessionStorage = parsedData.patientId;
    }

    this.patientForm.valueChanges.subscribe((formValue: any) => {
      sessionStorage.setItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE', JSON.stringify(formValue));
    });
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
        // If not set to false, it will display again the patient record data in the Edit Patient Tab if the browser
        // is refreshed
        this.editPatientService.setPatientId(0, false);
        this.toastR.success(response.message, 'Success');
        if (this.patientForm.value.visitType != null &&
          this.patientForm.value.visitType != '' &&
          this.patientForm.value.visitType != 'Direct Doctor Consultation' &&
          this.patientForm.value.visitType != 'Direct Doctor Follow-up Checkup') {
          sessionStorage.removeItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE');
          this.patientForm.reset();

          this.router.navigate(
            ['/apps/patient-management/patient-consultation/1'],
            { queryParams: { visit_id: response.data } }
          );
        } else {
          sessionStorage.removeItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE');
          this.patientForm.reset();
          this.patientRecordsService.setTabIndex(0);
        }
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }
}
