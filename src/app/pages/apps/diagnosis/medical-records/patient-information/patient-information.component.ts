import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {PatientInformationService} from "./patient-information.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {
  PatientRecords,
  PatientRecordsService
} from "../../../patient-management/patient-records/patient-records.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-patient-information-medical-records',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    FormsModule
  ],
  templateUrl: './patient-information.component.html',
  styleUrl: './patient-information.component.scss'
})
export class PatientInformationComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  patientRecord: PatientRecords;

  constructor(private patientInformationService: PatientInformationService,
              private patientRecordsService: PatientRecordsService,
              private toastR: ToastrService
  ) {

    this.patientInformationService.medicalRecordsEditViewMedicalRecordPatientIdObservable$.pipe(takeUntil(this.destroy$))
      .subscribe(patientId => {
        this.getPatientRecord(patientId);
      });
  }

  ngOnInit(): void {
    const savedData = sessionStorage.getItem('patient-information');
  }

  ngAfterViewInit() {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPatientRecord(patientId: number) {
    if (patientId) {
      this.patientRecordsService.getPatientRecordById(patientId).subscribe({
        next: data => {
          this.patientRecord = data;
        },
        error: error => {
          this.toastR.error(error.error.message, 'Error');
        }
      })
    }
  }
}
