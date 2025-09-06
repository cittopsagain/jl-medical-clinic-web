import {Component, Input} from '@angular/core';
import {
  MedicalHistoryApi,
  PatientPrescriptionList,
  PatientRecordsService,
  PatientVisits
} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {
  MatCell,
  MatCellDef,
  MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {DatePipe, NgIf, UpperCasePipe} from "@angular/common";

@Component({
  selector: 'app-medical-history',
  imports: [
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    DatePipe,
    UpperCasePipe,
    NgIf
  ],
  templateUrl: './medical-history.component.html',
  styleUrl: './medical-history.component.scss'
})
export class MedicalHistoryComponent {
  @Input() patientId: number | undefined;

  patientVisits: PatientVisits[] = [];
  patientPrescriptions: PatientPrescriptionList[] = [];

  selectedPatientPrescriptionsByVisit: PatientPrescriptionList[] = [];

  patientVisitsDisplayedColumns: string[] = ['visitId', 'dateTimeVisit', 'diagnosis'];
  patientPrescriptionsDisplayedColumns: string[] = ['visitId', 'productName', 'dosage', 'qty', 'unit'];

  constructor(private patientService: PatientRecordsService, private toastr: ToastrService) {

  }

  ngAfterViewInit() {
    this.getMedicalHistory();
  }

  getMedicalHistory() {
    if (this.patientId) {
      this.patientService.getMedicalHistory(this.patientId).subscribe({
        next: (data: MedicalHistoryApi) => {
          console.log(data);

          this.patientVisits = data.patientVisits;
          this.patientPrescriptions = data.patientPrescriptionsList;
        },
        error: (error) => {
          this.toastr.error('Unable to retrieve medical history', 'Oops!');
        }
      });
    } else {
      this.toastr.error('Unable to retrieve medical history: Patient ID is required', 'Oops!');
    }
  }

  onMedicalHistoryRowClick(index: number, row: PatientVisits) {
    // Get prescriptions related to this visit
    this.selectedPatientPrescriptionsByVisit = [];
    this.getPrescriptionsByVisitId(row.visitId);
  }

  /**
   * Returns prescriptions that match the given visit ID
   */
  getPrescriptionsByVisitId(visitId: number){
    for (let i = 0; i < this.patientPrescriptions.length; i++) {
      if (this.patientPrescriptions[i].visitId === visitId) {
        this.selectedPatientPrescriptionsByVisit.push(this.patientPrescriptions[i]);
      }
    }
  }
}
