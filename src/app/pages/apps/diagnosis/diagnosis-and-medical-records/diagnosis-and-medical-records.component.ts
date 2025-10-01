import {Component, OnInit} from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {PatientDiagnosisComponent} from "../patient-diagnosis/patient-diagnosis.component";
import {MedicalRecordsComponent} from "../medical-records/medical-records.component";
import {ActivatedRoute} from "@angular/router";

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

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));
    if (id == 1) {
      this.selectedTabIndex = 1;
    }
  }
}
