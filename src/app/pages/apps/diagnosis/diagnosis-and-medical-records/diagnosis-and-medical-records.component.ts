import {Component, OnInit} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {PatientDiagnosisComponent} from "../patient-diagnosis/patient-diagnosis.component";
import {MedicalRecordsComponent} from "../medical-records/medical-records.component";
import {ActivatedRoute} from "@angular/router";
import {VisitsService} from "../medical-records/visits/visits.service";
import {PrescriptionsService} from "../medical-records/prescriptions/prescriptions.service";
import {
  ViewPatientMedicalRecordsComponent
} from "../medical-records/view-patient-medical-records/view-patient-medical-records.component";
import {
  ViewPatientMedicalRecordsService
} from "../medical-records/view-patient-medical-records/view-patient-medical-records.service";

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
export class DiagnosisAndMedicalRecordsComponent implements OnInit {

  selectedTabIndex: number = 0;

  constructor(private route: ActivatedRoute,
              private visitsService: VisitsService,
              private prescriptionService: PrescriptionsService,
              private viewPatientMedicalRecordsService: ViewPatientMedicalRecordsService) {

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
