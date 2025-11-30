import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  Diagnosis,
  MedicalRecordsService,
  Prescription,
  Visits,
  VitalSigns
} from "../medical-records.service";
import {DatePipe, NgIf} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatButton, MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {VitalSignsService} from "../vital-signs/vital-signs.service";
import {PrescriptionsService} from "../prescriptions/prescriptions.service";
import {ToastrService} from "ngx-toastr";
import {VisitsService} from "./visits.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {MatIcon} from "@angular/material/icon";
import {ViewPatientMedicalRecordsService} from "../view-patient-medical-records/view-patient-medical-records.service";

@Component({
  selector: 'app-visits',
  imports: [
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
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    MatIcon
  ],
  templateUrl: './visits.component.html',
  styleUrl: './visits.component.scss'
})
export class VisitsComponent implements OnInit, OnDestroy {

  patientId: number;
  @Input() showActionsButton: boolean = true;

  visits: Visits[] = [];
  vitalSigns: VitalSigns[] = [];
  diagnosis: Diagnosis[] = [];
  prescriptions: Prescription[] = [];

  currentDiagnosis: Diagnosis; // Used in showRemarksDiv

  currentPatientVisitRowIndex: number;
  showRemarksDiv: boolean = false;

  get visitsDisplayedColumns(): string[] {
    return this.showActionsButton ?
      ['visitId', 'visitType', 'dateTimeVisit', 'diagnosis', 'action'] :
      ['visitId', 'dateTimeVisit', 'diagnosis'];
  }

  @ViewChild('remarksInput') remarksInput: ElementRef;
  @ViewChild('diagnosisInput') diagnosisInput: ElementRef;
  @ViewChild('patientComplaintsNotesInput') patientComplaintsNotesInput: ElementRef;
  @ViewChild('followupInput') followupInput: ElementRef;

  private destroy$ = new Subject<void>();

  constructor(private medicalRecordsService: MedicalRecordsService,
              private vitalSignsService: VitalSignsService,
              private prescriptionsService: PrescriptionsService,
              private toastR: ToastrService,
              private visitsService: VisitsService,
              private viewPatientMedicalRecordsService: ViewPatientMedicalRecordsService
  ) {
    this.visitsService.medicalRecordsEditViewMedicalRecordPatientIdObservable$.pipe(takeUntil(this.destroy$))
      .subscribe(patientId => {
        if (patientId) {
          this.patientId = patientId;
          this.getMedicalRecords(patientId);
          this.showRemarksDiv = false; // Force hide remarks div on patient change
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }

  getMedicalRecords(patientId: number) {
    return this.medicalRecordsService.getMedicalRecords(patientId ?? 0 ?? 0).subscribe({
      next: (res: any) => {
        for (let i = 0; i < res.prescriptions.length; i++) {
          this.prescriptions.push(res.prescriptions[i]);
        }

        const mapped = {
          visits: res.medicalRecords.map((r: any) => r.visits),
          vitalSigns: res.medicalRecords.map((r: any) => r.vitalSigns),
          diagnosis: res.medicalRecords.map((r: any) => r.diagnosis)
        };
        this.vitalSigns = mapped.vitalSigns;
        this.visits = mapped.visits;
        this.diagnosis = mapped.diagnosis;
      },
      error: (err) => {
        this.toastR.error(err.message);
      }
    });
  }

  getDiagnosisByPatientIdAndVisitId(visitId: number): string {
    const diagnosisRecord = this.diagnosis.find(d => d.visitId === visitId);
    return diagnosisRecord?.diagnosis || '';
  }

  getRemarksByPatientIdAndVisitId(visitId: number): string {
    const diagnosisRecord = this.diagnosis.find(d => d.visitId === visitId);
    return diagnosisRecord?.remarks || '';
  }

  updatePatientVisitDetails() {
    let remarks = this.remarksInput.nativeElement.value;
    this.diagnosis[this.currentPatientVisitRowIndex].remarks = remarks;

    this.medicalRecordsService.updatePatientVisitDetails(
      this.patientId ?? 0,
      this.visits[this.currentPatientVisitRowIndex].visitId,
      remarks,
      this.diagnosisInput?.nativeElement?.value || '',
      this.patientComplaintsNotesInput.nativeElement?.value || '',
      this.followupInput.nativeElement?.value || ''
    ).subscribe({
      next: (data) => {
        this.toastR.success(data.message, 'Success');
        this.getMedicalRecords(this.patientId);
      }, error: (err) => {
        this.toastR.error(err.error.message, 'Error');
      }
    });
  }

  onPatientVisitRowClick(visitId: number, row: any) {
    this.vitalSignsService.setVitalSigns(this.vitalSigns.find(v => v.visitId === visitId));
    this.viewPatientMedicalRecordsService.setTabDetails(this.patientId, visitId, row.visitDateTime);
  }

  printMedicalCertificate(visitId: number) {
    this.medicalRecordsService.getMedicalCertificate(this.patientId ?? 0, visitId).subscribe({
      next: (res: any) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        const visitDate = this.formatDateToYYYYMMDD(
          this.visits[this.currentPatientVisitRowIndex].visitDateTime
        );

        const issuedDate = this.formatDate(new Date());

        // Trigger download
        const a = document.createElement('a');
        a.href = fileURL;
        // a.download = `MedicalCertificate_${this.patientId}_Visit${visitDate}_Issued${issuedDate}.pdf`;
        a.download = `MedicalCertificate_${this.patientId}_Issued${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (err) => {
        this.toastR.error(err.error.message, 'Error');
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
