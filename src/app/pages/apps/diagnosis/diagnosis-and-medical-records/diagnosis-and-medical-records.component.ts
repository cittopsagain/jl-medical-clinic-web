import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {PatientDiagnosisComponent} from "../patient-diagnosis/patient-diagnosis.component";
import {MedicalRecordsComponent} from "../medical-records/medical-records.component";

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
export class DiagnosisAndMedicalRecordsComponent {

}
