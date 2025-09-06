import {Component} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MedicalRecordsService, Patient} from "../medical-records.service";
import {PatientInformationComponent} from "../patient-information/patient-information.component"
import {VitalSignsComponent} from "../vital-signs/vital-signs.component";
import {VisitsComponent} from "../visits/visits.component";
import {VitalSignsService} from "../vital-signs/vital-signs.service";
import {PrescriptionsComponent} from "../prescriptions/prescriptions.component";
import {PrescriptionsService} from "../prescriptions/prescriptions.service";
import {TablerIconComponent} from "angular-tabler-icons";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-view-patient-medical-records',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    RouterLink,
    PatientInformationComponent,
    VitalSignsComponent,
    VisitsComponent,
    PrescriptionsComponent,
    MatIconButton,
    TablerIconComponent
  ],
  templateUrl: './view-patient-medical-records.component.html',
  styleUrl: './view-patient-medical-records.component.scss'
})
export class ViewPatientMedicalRecordsComponent {

  patientInformation: Patient;
  visitId: number;

  constructor(private vitalSignsService: VitalSignsService, private prescriptionService: PrescriptionsService,
              private router: Router, private medicalRecordsService: MedicalRecordsService,
              private toastR: ToastrService,) {

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { patient: any };

    if (state) {
      // If data is from navigation, save it to localStorage and use it
      this.patientInformation = state.patient;
      localStorage.setItem('patientInformation', JSON.stringify(this.patientInformation));
    } else {
      // On page refresh, try to retrieve from localStorage
      const savedData = localStorage.getItem('patientInformation');
      if (savedData) {
        this.patientInformation = JSON.parse(savedData);
      }
    }
  }

  ngAfterViewInit() {
    this.vitalSignsService.vitalSigns$.subscribe(vitalSigns => {
      if (vitalSigns) {
        this.visitId = vitalSigns.visitId;
      }
    });
  }

  printPatientPrescription() {
    let patientId = this.patientInformation.patientId;
    let visitId = this.visitId;

    this.medicalRecordsService.getPrescription(patientId, visitId).subscribe({
      next: (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        const issuedDate = this.formatDate(new Date());

        // Trigger download
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `Prescription_${patientId}_Issued${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Oops!');
      }
    });
  }

  clearLocalStorage() {
    this.vitalSignsService.setVitalSigns(null);
    this.prescriptionService.setPrescriptions([]);
  }

  formatDate(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  formatDateToYYYYMMDD(dateStr: string): string {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

}
