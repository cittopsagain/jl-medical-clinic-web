import {Component, EventEmitter, OnDestroy, Output, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MedicalRecordsService, Patient} from "../medical-records.service";
import {PatientInformationComponent} from "../patient-information/patient-information.component";
import {VitalSignsService} from "../vital-signs/vital-signs.service";
import {PrescriptionsComponent} from "../prescriptions/prescriptions.component";
import {PrescriptionsService} from "../prescriptions/prescriptions.service";
import {ToastrService} from "ngx-toastr";
import {VisitsService} from "../visits/visits.service";
import {VisitsComponent} from "../visits/visits.component";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {takeUntil} from "rxjs/operators";
import {ViewPatientMedicalRecordsService} from "./view-patient-medical-records.service";
import {Subject} from "rxjs";
import {VitalSignsComponent} from "../vital-signs/vital-signs.component";

@Component({
  selector: 'app-view-patient-medical-records',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    PatientInformationComponent,
    VisitsComponent,
    MatButton,
    MatIcon,
    MatTabGroup,
    MatTab,
    PrescriptionsComponent,
    VitalSignsComponent,
  ],
  templateUrl: './view-patient-medical-records.component.html',
  styleUrl: './view-patient-medical-records.component.scss'
})
export class ViewPatientMedicalRecordsComponent implements OnDestroy {

  patientInformation: Patient;
  visitId: number;
  @ViewChild(PrescriptionsComponent) prescriptionComponent : PrescriptionsComponent;
  @Output() onClose = new EventEmitter<void>();
  private destroy$ = new Subject<void>();
  tabDetails: string = '';

  constructor(private vitalSignsService: VitalSignsService,
              private prescriptionService: PrescriptionsService,
              private router: Router,
              private medicalRecordsService: MedicalRecordsService,
              private toastR: ToastrService,
              private visitsService: VisitsService,
              private viewPatientMedicalRecordsService: ViewPatientMedicalRecordsService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { patient: any };

    if (state) {
      // If data is from navigation, save it to session storage and use it
      this.patientInformation = state.patient;
      sessionStorage.setItem('patientInformation', JSON.stringify(this.patientInformation));
      this.prescriptionService.setPatientIdAndVisitId(0, 0);
    } else {
      // On page refresh, try to retrieve from session storage
      const savedData = sessionStorage.getItem('patientInformation');
      if (savedData) {
        this.patientInformation = JSON.parse(savedData);
        this.prescriptionService.setPatientIdAndVisitId(0, 0);
      }
    }

    this.viewPatientMedicalRecordsService.viewPatientMedicalRecordObservable$.pipe(takeUntil(this.destroy$))
      .subscribe(({patientId, visitId, visitDate}) => {
        if (patientId && visitId && visitDate) {
          this.tabDetails = ' - Visit ID: ' + visitId + ', Visit Date: ' + this.formatDateToMonthDayYear(visitDate);

          this.prescriptionService.setPatientIdAndVisitId(patientId, visitId);
        } else {
          this.tabDetails = '';
        }
      });
  }

  closeView() {
    this.prescriptionService.setPatientIdAndVisitId(0, 0);
    this.tabDetails = '';
    this.vitalSignsService.setVitalSigns(null);
    this.onClose.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {

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

  formatDateToMonthDayYear(dateStr: string): string {
    const d = new Date(dateStr);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();

    return `${mm}/${dd}/${yyyy}`;
  }

}
