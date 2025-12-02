import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PatientConsultation, PatientConsultationService} from "../patient-consultation.service";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {DatePipe, NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {MatCheckbox} from "@angular/material/checkbox";
import {EditPatientConsultationService} from "./edit-patient-consultation.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: 'app-edit-patient-consultation',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    ReactiveFormsModule,
    TablerIconComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    DatePipe,
    NgIf,
    MatCheckbox
  ],
  templateUrl: './edit-patient-consultation.component.html',
  styleUrl: './edit-patient-consultation.component.scss'
})
export class EditPatientConsultationComponent implements OnInit {

  patientConsultationForm: UntypedFormGroup | any;
  patientConsultation: PatientConsultation;
  @ViewChild('weightInput') weightInput: ElementRef;
  private destroy$ = new Subject<void>();

  gender: string[] = [
    'Male',
    'Female'
  ];

  constructor(private patientConsultationService: PatientConsultationService,
              private fb: UntypedFormBuilder,
              private toastR: ToastrService,
              private editPatientConsultationService: EditPatientConsultationService,
              private cdr: ChangeDetectorRef,
              private patientConsultationListService: PatientConsultationService
  ) {

    this.patientConsultationForm = this.fb.group({
      weight: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]], // Accepts decimal numbers
      height: ['', [Validators.required, Validators.pattern('^\\d*\\d*$')]],
      temperature: ['',
        [
          Validators.required, Validators.pattern('^([0-9]|[1-3][0-9]|4[0-2])(\\.\\d{1,2})?$'),
          Validators.min(0), Validators.max(42)
        ]
      ],
      bloodPressure: ['', [Validators.required, Validators.pattern('^\\d+\\/\\d+$')]],
      heartRate: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]],
      oxygenSaturation: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]],
      status: ['']
    });
  }

  ngOnInit() {
    this.editPatientConsultationService.editPatientConsultationVisitIdObservable$.pipe(takeUntil(this.destroy$))
      .subscribe(visitId => {
        if (visitId !== null && visitId !== undefined) {
          this.getPatientConsultationById(visitId);
          this.cdr.detectChanges();
        }
      });

    this.patientConsultationForm.valueChanges.subscribe((formValue: any)=> {
      sessionStorage.setItem(
        'PATIENT_CONSULTATION_EDIT_PATIENT_CONSULTATION_VITAL_SIGNS_SESSION_STORAGE',
        JSON.stringify(formValue)
      );
    });
  }

  ngAfterViewInit() {
    // Delay focus to avoid ExpressionChangedAfterItHasBeenChecked error
    setTimeout(() => {
      if (this.weightInput) {
        this.weightInput.nativeElement.focus();
      }
    });
  }

  getPatientConsultationById(id: number) {
    const savedData = sessionStorage.getItem(
      'PATIENT_CONSULTATION_EDIT_PATIENT_CONSULTATION_VITAL_SIGNS_SESSION_STORAGE'
    );

    let parsedSavedData: any = null;
    if (savedData) {
      parsedSavedData = JSON.parse(savedData);
    }

    this.patientConsultationService.getPatientConsultationById(id).subscribe({
      next: (data: any) => {
        this.patientConsultation = data.data;

        this.patientConsultationForm.patchValue({
          patientId: data.data.patientId,
          consultationId: data.consultationId,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.data.lastName,
          sex: data.data.sex,
          birthDate: data.data.birthDate,
          address: data.data.address,
          consultationDate: data.data.consultationDate,
          weight: data.data.weight ? data.data.weight : parsedSavedData?.weight,
          height: data.data.height ? data.data.height : parsedSavedData?.height,
          temperature: data.data.temperature ? data.data.temperature : parsedSavedData?.temperature,
          bloodPressure: data.data.bloodPressure != '0/0' ? data.data.bloodPressure : parsedSavedData?.bloodPressure,
          heartRate: data.data.heartRate ? data.data.heartRate : parsedSavedData?.heartRate,
          oxygenSaturation: data.data.oxygenSaturation ? data.data.oxygenSaturation : parsedSavedData?.oxygenSaturation,
          status: parsedSavedData?.status? parsedSavedData.status : false
        });
      },
      error: (error) => {
        this.toastR.error("Error fetching patient information", 'Error');
      }
    });
  }

  updatePatientConsultation(event: Event) {
    this.patientConsultationForm.value.consultationId = this.patientConsultation.consultationId;
    this.patientConsultationService.updatePatientConsultation(this.patientConsultationForm.value).subscribe({
      next: (data: any) => {
        sessionStorage.removeItem('PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE')
        sessionStorage.removeItem('PATIENT_CONSULTATION_EDIT_PATIENT_CONSULTATION_VITAL_SIGNS_SESSION_STORAGE');

        this.toastR.success(data.message, 'Success');
        this.patientConsultationForm.reset();
        this.patientConsultationListService.setTabIndex(0);
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }

  checkInProgressConsultationStatusCount(event: Event) {
    if (this.patientConsultation.inProgressStatusCount) {
      this.toastR.warning('There is already an ongoing consultation. Cannot proceed.', 'Warning!');
      this.patientConsultationForm.get('status').setValue(false);
      event.preventDefault();
      return;
    }
  }
}
