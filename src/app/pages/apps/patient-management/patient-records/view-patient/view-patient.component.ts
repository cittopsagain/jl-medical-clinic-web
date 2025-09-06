import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {PatientRecords, PatientRecordsService} from "../patient-records.service";
import {ToastrService} from "ngx-toastr";
import {DatePipe, NgIf} from "@angular/common";
import {MatCheckbox} from "@angular/material/checkbox";
import {MedicalHistoryComponent} from "../medical-history/medical-history.component";
import {PrescriptionsComponent} from "../../../diagnosis/medical-records/prescriptions/prescriptions.component";
import {VisitsComponent} from "../../../diagnosis/medical-records/visits/visits.component";
import {VisitsService} from "../../../diagnosis/medical-records/visits/visits.service";
import {PrescriptionsService} from "../../../diagnosis/medical-records/prescriptions/prescriptions.service";

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
    MatCheckbox,
    MedicalHistoryComponent,
    NgIf,
    MatCardHeader,
    MatCardTitle,
    PrescriptionsComponent,
    VisitsComponent
  ],
  templateUrl: './view-patient.component.html',
  styleUrl: './view-patient.component.scss'
})
export class ViewPatientComponent {

  patientRecord: PatientRecords;

  constructor(private patientRecordsService: PatientRecordsService,
              private toastr: ToastrService, private route: ActivatedRoute,
              private visitsService: VisitsService, private prescriptionService: PrescriptionsService) {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.patientRecordsService.getPatientRecordById(id).subscribe({
        next: (data: PatientRecords) => {
          this.patientRecord = data;

          this.visitsService.setPatientId(data.patientId);
        },
        error: (error) => {
          this.toastr.error(error.error.message, 'Oops!');
        }
      });
    }
  }

  ngAfterViewInit() {
    this.prescriptionService.setPrescriptions([]);
  }

}
