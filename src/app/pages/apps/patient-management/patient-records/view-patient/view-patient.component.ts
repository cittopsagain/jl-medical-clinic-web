import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {ActivatedRoute} from "@angular/router";
import {PatientRecords, PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {DatePipe} from "@angular/common";
import {MedicalHistoryComponent} from "../medical-history/medical-history.component";
import {VisitsService} from "../../../diagnosis/medical-records/visits/visits.service";
import {PrescriptionsService} from "../../../diagnosis/medical-records/prescriptions/prescriptions.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ViewPatientService} from "./view-patient.service";
import {MatTab, MatTabGroup} from "@angular/material/tabs";

@Component({
  selector: 'app-view-patient',
  imports: [
    FormsModule,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    DatePipe,
    MedicalHistoryComponent,
    MatTab,
    MatTabGroup
  ],
  templateUrl: './view-patient.component.html',
  styleUrl: './view-patient.component.scss'
})
export class ViewPatientComponent implements OnInit, OnDestroy {

  patientRecord: PatientRecords;
  private destroy$ = new Subject<void>();

  constructor(private patientRecordsService: PatientRecordsService,
              private toastr: ToastrService, private route: ActivatedRoute,
              private visitsService: VisitsService, private prescriptionService: PrescriptionsService,
              private viewPatientService: ViewPatientService, private cdr: ChangeDetectorRef) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const savedData = JSON.parse(sessionStorage.getItem('PATIENT_RECORD_VIEW_PATIENT_SESSION_STORAGE') || '{}');
    if (savedData) {
     this.patientRecord = savedData;
    }

    this.viewPatientService.viewPatientPatientIdObservable$.pipe(takeUntil(this.destroy$)).subscribe(patientId => {
      if (patientId !== null && patientId !== undefined) {


        this.patientRecordsService.getPatientRecordById(patientId).subscribe({
          next: (data: PatientRecords) => {
            this.patientRecord = data;

            // this.visitsService.setPatientId(data.patientId);
            this.prescriptionService.setPrescriptions([]);
            sessionStorage.setItem('PATIENT_RECORD_VIEW_PATIENT_SESSION_STORAGE', JSON.stringify(data));
          },
          error: (error) => {
            this.toastr.error(error.error.message, 'Error');
          }
        });
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.prescriptionService.setPrescriptions([]);
  }
}
