import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {ActivatedRoute, Router} from "@angular/router";
import {PatientConsultation, PatientConsultationService} from "../patient-consultation.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {interval, merge, of as observableOf, Subject, Subscription} from "rxjs";
import {catchError, map, startWith, switchMap, takeUntil} from "rxjs/operators";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatChipsModule} from "@angular/material/chips";
import {NgClass, NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatSelect} from "@angular/material/select";
import {MatOption} from "@angular/material/core";
import {EditPatientConsultationComponent} from "../edit-patient-consultation/edit-patient-consultation.component";
import {EditPatientConsultationService} from "../edit-patient-consultation/edit-patient-consultation.service";

@Component({
  selector: 'app-patient-consultation-list',
  imports: [
    MatCard,
    MatCardContent,
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatTable,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIconButton,
    TablerIconComponent,
    MatChipsModule,
    NgClass,
    NgIf,
    MatTabGroup,
    MatTab,
    MatOption,
    MatSelect,
    EditPatientConsultationComponent
  ],
  templateUrl: './patient-consultation-list.component.html',
  styleUrl: './patient-consultation-list.component.scss'
})
export class PatientConsultationListComponent implements OnDestroy, OnInit {
  patientName: string;

  displayedColumns: string[] = [
    'number', 'consultationId', 'patientId', 'visitType', 'patientName', 'address', 'status', 'action'
  ];
  data: PatientConsultation[] = [];
  isLoadingResults = true;
  isError = false;

  refreshInterval: Subscription;
  status: string = '';

  filter: any[] = [
    {
      name: 'Patient Name',
      value: 'patient_name'
    },
    {
      name: 'Patient ID',
      value: 'patient_id'
    },
    {
      name: 'Visit ID',
      value: 'visit_id'
    }
  ];

  selectedTabIndex: number = 0;

  searchQuery: string = '';
  selectedFilterBy: string = 'patient_name';
  filterByInput: string = '';
  @ViewChild('searchQueryInput') searchQueryInput: ElementRef;

  @ViewChild('patientNameInput') patientNameInput: ElementRef;

  visitId: string = '';
  disableEditConsultationFollowupTab: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(private patientConsultationService: PatientConsultationService,
              private route: ActivatedRoute,
              private toastR: ToastrService,
              private editPatientConsultationService: EditPatientConsultationService,
              private router: Router,
              private patientConsultationListService: PatientConsultationService
  ) {
    this.patientName = '';
  }

  ngOnInit(): void {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));

    this.patientConsultationListService.patientConsultationTabBehaviorObservable$.pipe(takeUntil(this.destroy$)).subscribe(tabIndex => {
      if (tabIndex !== null && tabIndex !== undefined) {
        this.disableEditConsultationFollowupTab = true;
        this.selectedTabIndex = tabIndex;
        this.visitId = '';
      }
    });

    if (id) { // From Patient Records
      this.route.queryParams.subscribe(params => {
        this.selectedTabIndex = id;
        const visitId = params['visit_id'];
        this.setVisitId(visitId);
      });
    } else if (sessionStorage.getItem( // From Patient Consultation List
      'PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE'
    )) {
      this.setVisitId(Number(sessionStorage.getItem(
        'PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE'
      )));
      this.disableEditConsultationFollowupTab = false;
    } else {
      this.toastR.error('No Visit ID', 'Error');
    }
  }

  applyFilter() {
    this.getPatientConsultation();
  }

  ngAfterViewInit() {
    // Focus on the patient name input field after the view initializes
    if (this.searchQueryInput) {
      this.searchQueryInput.nativeElement.focus();
    }

    // Initial data load
    this.getPatientConsultation();

    // Set up automatic refresh every 5 seconds
    this.refreshInterval = interval(5000).subscribe(() => {
      this.getPatientConsultation();
    });
  }

  setVisitId(visitId: number) {
    if (sessionStorage.getItem(
      'PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE'
    ) && sessionStorage.getItem(
      'PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE'
    ) != visitId.toString()) {
      // Clear Vital Signs if Visit ID has changed
      sessionStorage.removeItem('PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE')
      sessionStorage.removeItem('PATIENT_CONSULTATION_EDIT_PATIENT_CONSULTATION_VITAL_SIGNS_SESSION_STORAGE');

      // Update the URL with the new visit_id
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { visit_id: visitId },
        queryParamsHandling: 'merge'
      });
    }

    sessionStorage.setItem(
      'PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE',
      visitId.toString()
    );
    this.editPatientConsultationService.setVisitId(visitId);
    this.visitId = ' - Visit ID: '+sessionStorage.getItem(
      'PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE'
    );
  }

  getPatientConsultation() {
    merge().pipe(
      startWith({}),
      switchMap(() => {
        return this.patientConsultationService!.getPatientConsultation(
          {
            search: this.searchQuery,
            filterBy: this.selectedFilterBy,
            status: this.status
          }
        );
      }),
      map((data: any) => {
        this.isLoadingResults = false;
        this.isError = false;

        return data.data;
      }),
      catchError((error: any) => {
        if (error.error.data != null && error.error.data == 0) { // No pending visits
          this.visitId = '';
          this.disableEditConsultationFollowupTab = true;
          this.selectedTabIndex = 0;
          sessionStorage.removeItem('PATIENT_CONSULTATION_PATIENT_CONSULTATION_LIST_VISIT_ID_SESSION_STORAGE');
          sessionStorage.removeItem('PATIENT_CONSULTATION_EDIT_PATIENT_CONSULTATION_VITAL_SIGNS_SESSION_STORAGE');
        }
        this.toastR.error(error.error?.message || 'Failed to load patient consultation', 'Error');

        this.isLoadingResults = false;
        this.isError = true;
        return observableOf([]);
      })
    ).subscribe((data: PatientConsultation[]) => {this.data = data});
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Waiting':
        return 'status-waiting';

      case 'In Progress':
        return 'status-in-progress';

      case 'Completed':
        return 'status-completed';

      default:
        return 'status-default';
    }
  }

  filterByStatus(status: string) {
    this.status = status;
    this.getPatientConsultation();
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
