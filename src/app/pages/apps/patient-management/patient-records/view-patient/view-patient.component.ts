import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {PatientRecords, PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {DatePipe} from "@angular/common";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-view-patient',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    MatCheckbox
  ],
  templateUrl: './view-patient.component.html',
  styleUrl: './view-patient.component.scss'
})
export class ViewPatientComponent {

  patientRecord: PatientRecords;

  constructor(private patientRecordsService: PatientRecordsService, private toastr: ToastrService, private route: ActivatedRoute) {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.patientRecordsService.getPatientRecordById(id).subscribe({
        next: (data: PatientRecords) => {
          this.patientRecord = data;
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Oops!');
        }
      });
    }
  }

  ngAfterViewInit() {

  }

}
