import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {PatientDiagnosisService} from "../../patient-diagnosis/patient-diagnosis.service";
import {
  PatientPrescriptionList,
  PatientVisits
} from "../../../patient-management/patient-records/patient-records.service";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatButton, MatIconButton} from "@angular/material/button";
import {DatePipe, NgIf, UpperCasePipe} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MedicalRecordsService} from "../medical-records.service";

@Component({
  selector: 'app-view-patient-medical-records',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    RouterLink,
    DatePipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatRow,
    MatRowDef,
    MatTable,
    NgIf,
    TablerIconComponent,
    MatHeaderCellDef,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    UpperCasePipe
  ],
  templateUrl: './view-patient-medical-records.component.html',
  styleUrl: './view-patient-medical-records.component.scss'
})
export class ViewPatientMedicalRecordsComponent implements OnInit {

  patientVisits: PatientVisits[] = [];
  patientPrescriptions: PatientPrescriptionList[] = [];
  showEditPatientVisit: boolean = false;
  patientVisitsDisplayedColumns: string[] = ['visitId', 'dateTimeVisit', 'diagnosis', 'action'];
  patientPrescriptionsDisplayedColumns: string[] = ['visitId', 'productName', 'dosage', 'qty', 'unit'];

  selectedPatientVisit: PatientVisits;
  selectedPatientPrescriptionsByVisit: PatientPrescriptionList[] = [];
  data: any;

  @ViewChild('remarksInput') remarksInput: ElementRef;

  constructor(private route: ActivatedRoute,
              private patientDiagnosisService: PatientDiagnosisService,
              private medicalRecordsService: MedicalRecordsService,
              private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { patient: any };

    if (state) {
      // If data is from navigation, save it to localStorage and use it
      this.data = state.patient;
      localStorage.setItem('patientData', JSON.stringify(this.data));
    } else {
      // On page refresh, try to retrieve from localStorage
      const savedData = localStorage.getItem('patientData');
      if (savedData) {
        this.data = JSON.parse(savedData);
      }
    }
  }

  ngOnInit() {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.getMedicalHistory(id);
    }
  }

  getMedicalHistory(patientId: number) {
    this.patientDiagnosisService.getMedicalHistory(patientId).subscribe({
      next: (response: any) => {
        this.patientVisits = response.patientVisits;
        this.patientPrescriptions = response.patientPrescriptionsList;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  printMedicalCertificate(row: PatientVisits) {
    this.medicalRecordsService.getMedicalCertificate(row.patientId, row.visitId).subscribe({
      next: (response: Blob) => {
        // Open PDF in new tab
        const fileURL = URL.createObjectURL(response);
        // window.open(fileURL);

        // Trigger download
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'medical-certificate.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Open PDF in new window
        window.open(fileURL, '_blank', 'width=900,height=900,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1');

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onMedicalHistoryRowClick(i: number, row: PatientVisits) {
    // Get prescriptions related to this visit
    this.selectedPatientPrescriptionsByVisit = [];
    this.getPrescriptionsByVisitId(row.visitId);
    this.selectedPatientVisit = row;
  }

  /**
   * Returns prescriptions that match the given visit ID
   */
  getPrescriptionsByVisitId(visitId: number) {
    for (let i = 0; i < this.patientPrescriptions.length; i++) {
      if (this.patientPrescriptions[i].visitId === visitId) {
        this.selectedPatientPrescriptionsByVisit.push(this.patientPrescriptions[i]);
      }
    }
  }

  updatePatientRemarks() {
    let remarks = this.remarksInput.nativeElement.value;
    this.selectedPatientVisit.remarks = this.remarksInput.nativeElement.value;
  }

}
