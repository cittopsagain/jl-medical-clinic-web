import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {MedicalRecordsService, Patient, PatientRecordsApi} from "./medical-records.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ToastrService} from "ngx-toastr";
import {merge, of as observableOf, Subject} from "rxjs";
import {catchError, map, startWith, switchMap, takeUntil} from "rxjs/operators";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {Router} from "@angular/router";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {
  ViewPatientMedicalRecordsComponent
} from "./view-patient-medical-records/view-patient-medical-records.component";
import {PatientInformationService} from "./patient-information/patient-information.service";
import {VisitsService} from "./visits/visits.service";

@Component({
  selector: 'app-medical-records',
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    FormsModule,
    MatSort,
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
    MatPaginator,
    MatOption,
    MatSelect,
    ViewPatientMedicalRecordsComponent,
  ],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.scss'
})
export class MedicalRecordsComponent implements OnInit, OnDestroy, AfterViewInit {

  displayedColumns: string[] = ['number', 'patientId', 'patientName', 'address', 'visitCount'];
  patientData: Patient[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;

  pageSize = 30;

  patientName: string = '';
  address: string = '';

  searchQuery: string = '';
  selectedFilterBy: string = 'patient_name';
  selectedTabIndex: number = 0;

  @ViewChild('patientNameInput') patientNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  filter: any[] = [
    {
      name: 'Patient Name',
      value: 'patient_name'
    },
    {
      name: 'Patient Id',
      value: 'patient_id'
    }
  ];
  showMedicalRecordsDetailsDiv: boolean = false;
  patientId: string = '';
  private reload$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private medicalRecordsService: MedicalRecordsService,
              private toastR: ToastrService,
              private router: Router,
              private patientInformationService: PatientInformationService,
              private visitsService: VisitsService,
              private cdr: ChangeDetectorRef
  ) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const savedData = sessionStorage.getItem('MEDICAL_RECORDS_EDIT_VIEW_MEDICAL_RECORDS_PATIENT_ID');
    if (savedData) {
      this.setPatientId(savedData);
      this.showMedicalRecordsDetailsDiv = true;
    }
  }

  ngAfterViewInit() {
    if (this.patientNameInput) {
      this.patientNameInput.nativeElement.focus();
    }

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page, this.reload$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.medicalRecordsService!.getPatientRecords(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            {
              search: this.searchQuery,
              filterBy: this.selectedFilterBy
            }
          ).pipe(
            catchError((error: any) => {
              this.toastR.error(error.error?.message || 'Failed to load medical records', 'Error');
              return observableOf(null);
            })
          );
        }),
        map((data: any | null): Patient[] => {
          this.isLoadingResults = false;
          if (data === null) {
            this.isError = true;
            return [];
          }
          this.isError = false;
          this.resultsLength = data.data.totalCount;
          return data.data.items;
        }),
        takeUntil(this.destroy$)
      ).subscribe((data: Patient[]) => (this.patientData = data));
  }

  applyFilter() {
    this.paginator.pageIndex = 0;
    this.reload$.next();
  }

  reinitializeComponent() {
    this.showMedicalRecordsDetailsDiv = false;
    this.patientId = '';
    this.searchQuery = '';
    this.selectedFilterBy = 'patient_name';
    sessionStorage.removeItem('MEDICAL_RECORDS_EDIT_VIEW_MEDICAL_RECORDS_PATIENT_ID');

    // Force change detection and wait for view to render
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      if (this.sort) {
        this.sort.active = 'last_name';
        this.sort.direction = 'asc';
      }

      // Trigger data reload after view is ready
      this.reload$.next();

      if (this.patientNameInput?.nativeElement) {
        this.patientNameInput.nativeElement.focus();
      }
    }, 0);
  }

  setPatientId(patientId: string) {
    this.patientId = ' - Patient Id: ' + patientId;
    sessionStorage.setItem('MEDICAL_RECORDS_EDIT_VIEW_MEDICAL_RECORDS_PATIENT_ID', patientId);

    if (patientId) {
      this.patientInformationService.setPatientId(patientId);
      this.visitsService.setPatientId(patientId);
    }
  }
}
