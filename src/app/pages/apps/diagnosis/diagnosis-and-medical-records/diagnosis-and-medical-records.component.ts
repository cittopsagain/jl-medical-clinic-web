import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {PatientDiagnosisComponent} from "../patient-diagnosis/patient-diagnosis.component";
import {MedicalRecordsComponent} from "../medical-records/medical-records.component";
import {ActivatedRoute} from "@angular/router";
import {VisitsService} from "../medical-records/visits/visits.service";
import {PrescriptionsService} from "../medical-records/prescriptions/prescriptions.service";
import {
  ViewPatientMedicalRecordsService
} from "../medical-records/view-patient-medical-records/view-patient-medical-records.service";
import {CanComponentDeactivate} from "../../apps.routes";
import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Component({
  selector: 'app-diagnosis-and-medical-records',
  imports: [
    MatTabGroup,
    MatTab,
    PatientDiagnosisComponent,
    MedicalRecordsComponent
  ],
  templateUrl: './diagnosis-and-medical-records.component.html',
  styleUrl: './diagnosis-and-medical-records.component.scss'
})
export class DiagnosisAndMedicalRecordsComponent implements OnInit, CanComponentDeactivate {

  selectedTabIndex: number = 0;

  constructor(private route: ActivatedRoute,
              private visitsService: VisitsService,
              private prescriptionService: PrescriptionsService,
              private viewPatientMedicalRecordsService: ViewPatientMedicalRecordsService,
              private dialog: MatDialog) {

  }

  canDeactivate(): Observable<boolean> | boolean {
    const diagnosisSuccessSave = sessionStorage.getItem('DIAGNOSIS_SUCCESS_SAVE_SESSION_STORAGE');
    if (diagnosisSuccessSave) {
      const parsedData = JSON.parse(diagnosisSuccessSave);
      if (parsedData === 1) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Warning',
            message: 'Navigating away will clear the diagnosis content on the screen. Do you want to continue?',
            confirmText: 'Continue',
            cancelText: 'Cancel'
          },
          disableClose: true
        });

        return dialogRef.afterClosed().pipe(
          map(result => {
            if (result) {
              this.prescriptionService.setPatientIdAndVisitId(0, 0);
              sessionStorage.removeItem('DIAGNOSIS_SUCCESS_SAVE_SESSION_STORAGE');
              sessionStorage.removeItem('DIAGNOSIS_PATIENT_INFORMATION_SESSION_STORAGE');
              sessionStorage.removeItem('DIAGNOSIS_PRESCRIPTION_SESSION_STORAGE');
              sessionStorage.removeItem('DIAGNOSIS_MEDICAL_SUMMARY_SESSION_STORAGE');
              sessionStorage.removeItem('DIAGNOSIS_VITAL_SIGNS_SESSION_STORAGE');
            }
            return result;
          })
        );
      }
    }

    return true;
  }

  ngOnInit(): void {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));
    if (id == 1) {
      this.selectedTabIndex = 1;
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    const index = event.index;

    const savedDataPatientInformation = sessionStorage.getItem('DIAGNOSIS_PATIENT_INFORMATION_SESSION_STORAGE');
    const savedDataMedicalRecordsPatientId = sessionStorage.getItem('MEDICAL_RECORDS_EDIT_VIEW_MEDICAL_RECORDS_PATIENT_ID');

    this.prescriptionService.setPatientIdAndVisitId(0, 0);
    this.viewPatientMedicalRecordsService.setTabDetails(0, 0, '');

    // Diagnosis Tab
    if (index == 0) {
      if (savedDataPatientInformation) {
        const parsedData = JSON.parse(savedDataPatientInformation);
        this.visitsService.setPatientId(parsedData.patientId);
      } else {
        this.visitsService.setPatientId('');
      }
    }

    // Medical Records Tab
    if (index == 1) {
      if (savedDataMedicalRecordsPatientId) {
        this.visitsService.setPatientId(savedDataMedicalRecordsPatientId);
      }
    }
  }
}
