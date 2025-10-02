import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatIcon} from "@angular/material/icon";
import {PatientConsultationService} from "../patient-consultation.service";

@Component({
  selector: 'app-add-patient-consultation',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    RouterLink,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
    MatSuffix,
    TablerIconComponent
  ],
  templateUrl: './add-patient-consultation.component.html',
  styleUrl: './add-patient-consultation.component.scss'
})
export class AddPatientConsultationComponent {
  patientName: string;
  @ViewChild('patientNameInput') patientNameInput: ElementRef;

  constructor(private patientConsultation: PatientConsultationService) {

  }

  ngAfterViewInit() {
    // Focus on the patient name input field after the view initializes
    if (this.patientNameInput) {
      this.patientNameInput.nativeElement.focus();
    }
  }

  savePatientConsultation(event: Event) {

  }

  applyFilter() {
    // this.patientConsultation.getPatientConsultation('dave').subscribe();
  }

}
