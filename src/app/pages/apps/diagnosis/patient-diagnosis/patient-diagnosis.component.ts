import {Component, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  MatDatepickerModule
} from "@angular/material/datepicker";
import { TablerIconComponent } from "angular-tabler-icons";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {PatientDiagnosisService} from "./patient-diagnosis.service";
import {ToastrService} from "ngx-toastr";
import { MatExpansionModule } from '@angular/material/expansion';
import {MatTab, MatTabGroup, MatTabLabel} from '@angular/material/tabs'
import {
  MatTableModule
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MedicalRecordsService, Patient, VitalSigns} from "../medical-records/medical-records.service";
import {MedicalSummaryComponent} from "./medical-summary/medical-summary.component";
import {PrescriptionComponent} from "./prescription/prescription.component";
import {PrescriptionsComponent} from "../medical-records/prescriptions/prescriptions.component";
import {VisitsComponent} from "../medical-records/visits/visits.component";
import {VisitsService} from "../medical-records/visits/visits.service";
import {DatePipe, NgIf} from "@angular/common";
import {PrescriptionsService} from "../medical-records/prescriptions/prescriptions.service";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatSelect} from "@angular/material/select";
import {PatientRecordsService} from "../../patient-management/patient-records/patient-records.service";
import {PatientConsultationService} from "../../patient-management/patient-consultation/patient-consultation.service";

@Component({
  selector: 'app-patient-diagnosis',
  imports: [
    MatButton,
    MatDatepickerModule,
    TablerIconComponent,
    FormsModule,
    MatCard,
    MatCardContent,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTab,
    MatIcon,
    MatTabGroup,
    MatTabLabel,
    MatTableModule,
    MedicalSummaryComponent,
    PrescriptionComponent,
    MatCardHeader,
    VisitsComponent,
    NgIf,
    MatCardTitle,
    PrescriptionsComponent,
    MatIconButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    MatSuffix,
    MatOption,
    MatSelect
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './patient-diagnosis.component.html',
  styleUrl: './patient-diagnosis.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ]
})

export class PatientDiagnosisComponent {

  patientForm: UntypedFormGroup | any;
  vitalSignsForm: UntypedFormGroup | any;

  @ViewChild(PrescriptionComponent) prescriptionComponent: PrescriptionComponent;
  @ViewChild(MedicalSummaryComponent) medicalSummaryComponent: MedicalSummaryComponent;
  @ViewChild(VisitsComponent) visitsComponent: VisitsComponent;

  patientInformation: Patient;
  vitalSigns: VitalSigns;

  showPrintMedicalCertificateButton: boolean = false;
  showSaveButton: boolean = true;
  showUpdateButton: boolean = false;
  showMoveToWaitingButton: boolean = true;

  patientId: number = 0;
  visitId: number = 0;
  diagnosisId: number = 0;

  visitType: string[] = ['Consultation', 'Follow-up Checkup'];
  gender: string[] = [
    'Male',
    'Female'
  ];

  constructor(private patientDiagnosisService: PatientDiagnosisService, private fb: UntypedFormBuilder,
              private toastR: ToastrService, private visitsService: VisitsService,
              private patientPrescription: PrescriptionsService,
              private medicalRecordsService: MedicalRecordsService, private patientRecordsService: PatientRecordsService,
              private patientConsultationService: PatientConsultationService) {
    this.patientForm = this.fb.group({
      visitId: '',
      patientId: '',
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: '',
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      sex: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      markForConsultation: [0],
      visitType: ['', Validators.required],
      age: ''
    });

    this.vitalSignsForm = this.fb.group({
      consultationId: ['', Validators.required],
      weight: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]], // Accepts decimal numbers
      height: ['', [Validators.required, Validators.pattern('^\\d*\\d*$')]],
      temperature: ['', [Validators.required, Validators.pattern('^([0-9]|[1-3][0-9]|4[0-2])(\\.\\d{1,2})?$'), Validators.min(0), Validators.max(42)]],
      bloodPressure: ['', [Validators.required, Validators.pattern('^\\d+\\/\\d+$')]],
      heartRate: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]],
      oxygenSaturation: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]],
      status: 'true' // Will be interpreted to IN_PROGRESS in the backend
    });
  }

  ngAfterViewInit() {
    this.patientPrescription.setPrescriptions([]);
    this.getPatientDiagnosis();

    this.refreshPatientDiagnosis();
  }

  getPatientDiagnosis() {
    this.patientDiagnosisService.getPatientDiagnosis().subscribe({
      next: (data: any) => {
        if (data.data == null) {
          // this.toastR.error('No patients waiting for check-up or consultation.', 'Error');
        }

        this.patientInformation = data.data.patient;

        this.patientForm.patchValue(
          {
            patientId: data.data.patient.patientId,
            visitId: data.data.patient.visitId,
            lastName: data.data.patient.lastName,
            firstName: data.data.patient.firstName,
            middleName: data.data.patient.middleName,
            address: data.data.patient.address,
            birthDate: data.data.patient.birthDate,
            sex: data.data.patient.gender,
            contactNumber: data.data.patient.contactNumber,
            markForConsultation: 0,
            visitType: data.data.patient.visitType,
            age: this.calculateAge(data.data.patient.birthDate)
          }
        );

        this.vitalSigns = data.data.vitalSigns;
        this.visitId = data.data.vitalSigns.visitId;

        this.vitalSignsForm.patchValue(
          {
            consultationId: data.data.vitalSigns.visitId,
            weight: data.data.vitalSigns.weight,
            height: data.data.vitalSigns.height,
            temperature: data.data.vitalSigns.temperature,
            bloodPressure: data.data.vitalSigns.bloodPressure,
            heartRate: data.data.vitalSigns.heartRate,
            oxygenSaturation: data.data.vitalSigns.oxygenSaturation
          }
        );

        this.prescriptionComponent.prescriptionList = [];

        this.medicalSummaryComponent.diagnosisForm.reset();

        this.medicalSummaryComponent.diagnosisForm.patchValue({
          followUpCheckupRemarks: 'Follow up on 7th day if symptoms persists'
        });

        this.showPrintMedicalCertificateButton = false;
        this.showSaveButton = true;
      },
      error: (error) => {
        // this.toastR.error(error.error.message, 'Error');
        this.toastR.error(error.error?.message || 'Failed to load patient diagnosis', 'Error');
      }
    });
  }

  savePatientDiagnosis() {
    if (this.patientForm.invalid || this.vitalSignsForm.invalid) {
      this.toastR.error('Please fill out all required fields in the Patient Information and Vital Signs forms.', 'Error');
      return;
    }

    if (this.medicalSummaryComponent.diagnosisForm.invalid) {
      this.toastR.error('Please fill out all required fields in the Diagnosis form.', 'Error');
      return;
    }

    let patientMedicalSummary = {
      ...this.medicalSummaryComponent.diagnosisForm.value,
      visitId: this.visitId,
      patientId: this.patientInformation.patientId
    };

    let data = {
      patientMedicalSummary: patientMedicalSummary,
      prescriptions: this.prescriptionComponent.prescriptionList
    };

    this.patientDiagnosisService.savePatientDiagnosis(data).subscribe({
      next: (data: any) => {
        if (data.statusCode == 201) {
          this.toastR.success(data.message, 'Success');
          this.showPrintMedicalCertificateButton = true;
          this.showMoveToWaitingButton = false;
          this.showSaveButton = false;
          this.showUpdateButton = true;

          this.patientId = data.data.patientId;
          this.visitId = data.data.visitId;
          this.diagnosisId = data.data.diagnosisId;

          this.printPatientPrescription();
        } else {
          this.toastR.error(data.message, 'Error');
        }
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }

  updatePatientDiagnosis() {
    if (this.medicalSummaryComponent.diagnosisForm.invalid) {
      this.toastR.error('Please fill out all required fields in the Diagnosis form.', 'Error');
      return;
    }

    let patientMedicalSummary = {
      ...this.medicalSummaryComponent.diagnosisForm.value,
      visitId: this.vitalSigns.visitId,
      patientId: this.patientInformation.patientId,
      diagnosisId: this.diagnosisId,
    };

    let data = {
      patientMedicalSummary: patientMedicalSummary,
      prescriptions: this.prescriptionComponent.prescriptionList
    };

    this.patientDiagnosisService.updatePatientDiagnosis(data).subscribe({
      next: (data: any) => {
        if (data.statusCode == 200) {
          this.toastR.success(data.message, 'Success');
          this.showPrintMedicalCertificateButton = true;
          this.showSaveButton = false;
          this.showUpdateButton = true;

          this.printPatientPrescription();
        } else {
          this.toastR.error(data.message, 'Error');
        }
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }

  refreshPatientDiagnosis() {
    this.patientDiagnosisService.getInProgressPatient().subscribe(
      {
        next: (data: any) => {
          if (data.data == false) {
            this.toastR.error('Either no patients are marked as In-Progress, or no patients are waiting.', 'Error');
            return;
          }

          this.getPatientDiagnosis();

          this.showUpdateButton = false;
          this.showSaveButton = true;
        },
        error: (error) => {
          // this.toastR.error(error.error.message, 'Error');
          this.toastR.error(error.error?.message || 'Failed to patient diagnosis', 'Error');
        }
      }
    );
  }

  updatePatientInformation() {
    this.patientRecordsService.updatePatientRecord(this.patientForm.value).subscribe({
      next: (data: any) => {
        if (data.statusCode == 200) {
          this.toastR.success(data.message, 'Success');
          // this.patientInformation = this.patientForm.value;

          this.patientForm.patchValue({
            visitId: this.visitId,
            patientId: this.patientForm.value.patientId,
            lastName: this.patientForm.value.lastName,
            firstName: this.patientForm.value.firstName,
            middleName: this.patientForm.value.middleName,
            address: this.patientForm.value.address,
            birthDate: this.patientForm.value.birthDate
          });
        } else {
          this.toastR.error(data.message, 'Error');
        }
      },
      error: (error) => {
        this.toastR.error(error.error?.message || 'Failed to update patient information', 'Error');
      }
    });
  }

  updateVitalSigns() {
    this.patientConsultationService.updatePatientConsultation(this.vitalSignsForm.value).subscribe({
      next: (data: any) => {
        if (data.statusCode == 200) {
          this.toastR.success(data.message, 'Success');
          // this.vitalSigns = this.vitalSignsForm.value;

          this.vitalSignsForm.patchValue({
            consultationId: this.visitId,
            weight: this.vitalSignsForm.value.weight,
            height: this.vitalSignsForm.value.height,
            temperature: this.vitalSignsForm.value.temperature,
            bloodPressure: this.vitalSignsForm.value.bloodPressure,
            heartRate: this.vitalSignsForm.value.heartRate,
            oxygenSaturation: this.vitalSignsForm.value.oxygenSaturation,
            status: 'true' // Will be interpreted to IN_PROGRESS in the backend
          });
        } else {
          this.toastR.error(data.message, 'Error');
        }
      },
      error: (error) => {
        this.toastR.error(error.error?.message || 'Failed to update vital signs', 'Error');
      }
    });
  }

  printMedicalCertificate() {
    this.medicalRecordsService.getMedicalCertificate(this.patientId, this.visitId).subscribe({
      next: (res: any) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        const issuedDate = this.formatDate(new Date());

        // Trigger download
        /* const a = document.createElement('a');
        a.href = fileURL;
        a.download = `MedicalCertificate_${this.patientId}_Issued${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        URL.revokeObjectURL(fileURL); */
      },
      error: (err) => {
        this.toastR.error(err.error.message, 'Error');
      }
    });
  }

  printPatientPrescription(history: boolean = false) {
    if (history) {
      let patientId = this.patientInformation.patientId;
      let visitId = this.visitsComponent.visits[
        this.visitsComponent.currentPatientVisitRowIndex
        ].visitId;

      this.patientId = patientId;
      this.visitId = visitId;
    }

    this.medicalRecordsService.getPrescription(this.patientId, this.visitId).subscribe({
      next: (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        const issuedDate = this.formatDate(new Date());

        // Trigger download
        /* const a = document.createElement('a');
        a.href = fileURL;
        a.download = `Prescription_${this.patientId}_Issued${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        URL.revokeObjectURL(fileURL);  */
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }

  moveToWaitingStatus() {
    if (this.patientInformation?.patientId == null) {
      this.toastR.warning('No patient selected to move to waiting status', 'Warning');
      return;
    }

    this.patientDiagnosisService.updatePatientStatusToWaiting({
      patientId: this.patientInformation.patientId,
      visitId: this.visitId,
    }).subscribe({
      next: (data: any) => {
        if (data.statusCode == 200) {
          this.patientForm.reset();
          this.vitalSignsForm.reset();
          this.showMoveToWaitingButton = false;
          this.toastR.success(data.message, 'Success');
          return;
        }

        this.toastR.error(data.message, 'Error');
      },
      error: (error) => {
        this.toastR.error('Failed to move patient to waiting status', 'Error');
      }
    });
  }

  onBirthDateSelected() {
    this.patientForm.patchValue({
      age: this.calculateAge(this.patientForm.value.birthDate)
    });
  }

  // Todo: Transfer it to utility class
  formatDate(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  // Todo: Transfer it to utility class
  formatDateToYYYYMMDD(dateStr: string): string {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  calculateAge(value: string): string {
    const birthDate = new Date(value);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    // Adjust years and months if needed
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    return `${years} years ${months} months`;
  }
}
