import {Component, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  MatDatepickerModule
} from "@angular/material/datepicker";
import { TablerIconComponent } from "angular-tabler-icons";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { provideNativeDateAdapter } from '@angular/material/core';
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
import {PatientInformationComponent} from "../medical-records/patient-information/patient-information.component";
import {MedicalRecordsService, Patient, VitalSigns} from "../medical-records/medical-records.service";
import {VitalSignsComponent} from "../medical-records/vital-signs/vital-signs.component";
import {MedicalSummaryComponent} from "./medical-summary/medical-summary.component";
import {PrescriptionComponent} from "./prescription/prescription.component";
import {
  MedicalHistoryComponent
} from "../../patient-management/patient-records/medical-history/medical-history.component";
import {PrescriptionsComponent} from "../medical-records/prescriptions/prescriptions.component";
import {VisitsComponent} from "../medical-records/visits/visits.component";
import {VisitsService} from "../medical-records/visits/visits.service";
import {NgIf} from "@angular/common";
import {PrescriptionsService} from "../medical-records/prescriptions/prescriptions.service";

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
    PatientInformationComponent,
    VitalSignsComponent,
    MedicalSummaryComponent,
    PrescriptionComponent,
    MatCardHeader,
    VisitsComponent,
    NgIf,
    MatCardTitle,
    PrescriptionsComponent,
    MatIconButton
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

  @ViewChild(PrescriptionComponent) prescriptionComponent: PrescriptionComponent;
  @ViewChild(MedicalSummaryComponent) medicalSummaryComponent: MedicalSummaryComponent;
  @ViewChild(VisitsComponent) visitsComponent: VisitsComponent;

  patientInformation: Patient;
  vitalSigns: VitalSigns;

  showPrintMedicalCertificateButton: boolean = false;
  showSaveButton: boolean = true;

  patientId: number = 0;
  visitId: number = 0;

  constructor(private patientDiagnosisService: PatientDiagnosisService,
              private toastR: ToastrService, private visitsService: VisitsService,
              private patientPrescription: PrescriptionsService,
              private medicalRecordsService: MedicalRecordsService) {
  }

  ngAfterViewInit() {
    this.patientPrescription.setPrescriptions([]);
    this.getPatientDiagnosis();
  }

  getPatientDiagnosis() {
    this.patientDiagnosisService.getPatientDiagnosis().subscribe({
      next: (data: any) => {
        if (data.data == null) {
          // this.toastR.error('No patients waiting for check-up or consultation.', 'Oops!');
        }

        this.patientInformation = data.data.patient;
        this.vitalSigns = data.data.vitalSigns;

        this.prescriptionComponent.prescriptionList = [];
        this.medicalSummaryComponent.diagnosisForm.reset();
        this.showPrintMedicalCertificateButton = false;
        this.showSaveButton = true;
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Oops!');
      }
    });
  }

  savePatientDiagnosis() {
    if (this.medicalSummaryComponent.diagnosisForm.invalid) {
      this.toastR.error('Please fill out all required fields in the Diagnosis form.', 'Oops!');
      return;
    }

    let patientMedicalSummary = {
      ...this.medicalSummaryComponent.diagnosisForm.value,
      visitId: this.vitalSigns.visitId,
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
          this.showSaveButton = false;

          this.patientId = data.data.patientId;
          this.visitId = data.data.visitId;

          this.printPatientPrescription();
        } else {
          this.toastR.error(data.message, 'Oops!');
        }
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Oops!');
      }
    });
  }

  refreshPatientDiagnosis() {
    this.patientDiagnosisService.getInProgressPatient().subscribe(
      {
        next: (data: any) => {
          if (data.data == false) {
            this.toastR.error('Either no patients are marked as In-Progress, or no patients are waiting.', 'Oops!');
            return;
          }

          this.getPatientDiagnosis();
        },
        error: (error) => {
          this.toastR.error(error.error.message, 'Oops!');
        }
      }
    );
  }

  printMedicalCertificate() {
    this.medicalRecordsService.getMedicalCertificate(this.patientId, this.visitId).subscribe({
      next: (res: any) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        const issuedDate = this.formatDate(new Date());

        // Trigger download
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `MedicalCertificate_${this.patientId}_Issued${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (err) => {
        this.toastR.error(err.error.message, 'Oops!');
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
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `Prescription_${this.patientId}_Issued${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Oops!');
      }
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
}
