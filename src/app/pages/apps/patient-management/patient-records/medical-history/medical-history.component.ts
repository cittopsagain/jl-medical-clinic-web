import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {
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
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MedicalHistoryService} from "./medicalhistory.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

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
    NgIf,
    MatCard,
    MatCardContent,
    MatCardTitle
  ],
  templateUrl: './medical-history.component.html',
  styleUrl: './medical-history.component.scss'
})
export class MedicalHistoryComponent implements OnChanges, OnInit {
  @Input() patientId: number | undefined;

  patientVisits: PatientVisits[] = [];
  patientPrescriptions: PatientPrescriptionList[] = [];

  selectedPatientPrescriptionsByVisit: PatientPrescriptionList[] = [];

  patientVisitsDisplayedColumns: string[] = ['visitId', 'dateTimeVisit', 'diagnosis'];
  patientPrescriptionsDisplayedColumns: string[] = ['visitId', 'productName', 'dosage', 'qty', 'unit'];
  private destroy$ = new Subject<void>();

  constructor(private patientService: PatientRecordsService,
              private toastr: ToastrService,
              private patientRecordMedicalHistory: MedicalHistoryService,
              private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.patientRecordMedicalHistory.patientRecordMedicalHistoryPatientVisitObservable$.pipe(takeUntil(this.destroy$))
      .subscribe(patientId => {
        this.patientVisits = [];
        this.patientPrescriptions = [];
        this.cdr.detectChanges();
      });

    if (this.patientId) {
      this.getMedicalHistory();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientId'] && !changes['patientId'].firstChange) {
      this.patientPrescriptions = [];
      if (this.patientId) {
        this.getMedicalHistory();
      } else {
        this.patientVisits = [];
      }
    }
  }

  ngAfterViewInit() {

  }

  getMedicalHistory() {
    if (this.patientId) {
      this.patientService.getMedicalHistory(this.patientId).subscribe({
        next: (data: any) => {
          this.patientVisits = data.medicalRecords;
        },
        error: (error) => {
          this.toastr.error('Unable to retrieve medical history', 'Error');
        }
      });
    } else {
      this.toastr.error('Unable to retrieve medical history: Patient ID is required', 'Error');
    }
  }

  onMedicalHistoryRowClick(index: number, row: any) {
    this.getPrescription(row.visits.patientId, row.visits.visitId);
  }

  getPrescriptionsByVisitId(visitId: number){
    for (let i = 0; i < this.patientPrescriptions.length; i++) {
      if (this.patientPrescriptions[i].visitId === visitId) {
        this.selectedPatientPrescriptionsByVisit.push(this.patientPrescriptions[i]);
      }
    }
  }

  getPrescription(patientId: number, visitId: number) {
    this.patientService.getPrescription(patientId, visitId).subscribe({
      next: (data: any) => {
        this.patientPrescriptions = data;
      },
      error: (error) => {
        this.toastr.error('Unable to retrieve prescription', 'Error');
      }
    });
  }
}
