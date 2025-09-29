import {Component, Input} from '@angular/core';
import {Patient} from "../medical-records.service";
import {DatePipe} from "@angular/common";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-patient-information-medical-records',
  imports: [
    DatePipe,
    MatFormField,
    MatInput,
    MatLabel,
    FormsModule
  ],
  templateUrl: './patient-information.component.html',
  styleUrl: './patient-information.component.scss'
})
export class PatientInformationComponent {

  @Input() patientInformation: Patient;

  constructor() {

  }

  ngAfterViewInit() {
  }

}
