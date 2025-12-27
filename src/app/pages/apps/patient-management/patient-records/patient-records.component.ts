import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap, takeUntil} from "rxjs/operators";
import {CommonModule} from "@angular/common";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {TablerIconsModule} from "angular-tabler-icons";
import {MatDividerModule} from "@angular/material/divider";
import {PatientRecords, PatientRecordsService} from "./patient-records.service";
import {MatIconButton} from "@angular/material/button";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {Employee} from "../../employee/employee";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDeleteDialogComponent} from "./confirm-delete-dialog/confirm-delete-dialog.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {AddPatientComponent} from "./add-patient/add-patient.component";
import {EditPatientComponent} from "./edit-patient/edit-patient.component";
import {EditPatientService} from "./edit-patient/edit-patient.service";
import {ViewPatientComponent} from "./view-patient/view-patient.component";
import {ViewPatientService} from "./view-patient/view-patient.service";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-patient-records',
  imports: [
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    CommonModule,
    TablerIconsModule,
    MatSortModule,
    MatDividerModule,
    MatInput,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    MatIconButton,
    MatTab,
    MatTabGroup,
    MatOption,
    MatSelect,
    AddPatientComponent,
    EditPatientComponent,
    ViewPatientComponent
  ],
  templateUrl: './patient-records.component.html',
  styleUrl: './patient-records.component.scss'
})
export class PatientRecordsComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<string>();

  @ViewChild('patientNameInput') patientNameInput: ElementRef;

  displayedColumns: string[] = ['number', 'patientId', 'patientName', 'address', 'dateCreated', 'action'];
  data: PatientRecords[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;

  pageSize = 30;

  patientName: string;
  address: string;

  filter: any[] = [
    {
      name: 'Patient Name',
      value: 'patient_name'
    },
    {
      name: 'Patient ID',
      value: 'patient_id'
    }
  ];

  searchQuery: string = '';
  selectedFilterBy: string = 'patient_name';
  filterByInput: string = '';

  selectedTabIndex: number = 0;
  private destroy$ = new Subject<void>();

  editPatientId: string;
  viewPatientId: string;

  disableEditTab: boolean = true;
  disableViewTab: boolean = true;


  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  // tslint:disable-next-line - Disables all
  constructor(public patientRecordService: PatientRecordsService,
              private toastR: ToastrService,
              private dialog: MatDialog,
              private cdr: ChangeDetectorRef,
              public editPatientService: EditPatientService,
              public viewPatientService: ViewPatientService
  ) {}

  ngOnInit(): void {
    // Wait 300ms after typing stops before searching
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
    this.patientRecordService.patientRecordTabBehaviorObservable$.pipe(takeUntil(this.destroy$)).subscribe(tabIndex => {
      if (tabIndex !== null && tabIndex !== undefined) {
        const savedData = JSON.parse(
          sessionStorage.getItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE') || '{}'
        );

        if (savedData.patientId == null) {
          this.editPatientId = '';
          this.disableEditTab = true;
        }

        this.getPatientRecords();
        this.selectedTabIndex = tabIndex;
        this.cdr.detectChanges();
      }
    });

    this.updatePatientIdFromStorage();
  }

  private updatePatientIdFromStorage(): void {
    const savedData = JSON.parse(
      sessionStorage.getItem('PATIENT_RECORD_EDIT_PATIENT_SESSION_STORAGE') || '{}'
    );

    if (savedData?.patientId) {
      this.editPatientId = ' - Patient ID: ' + savedData.patientId;
      this.disableEditTab = false;
    }

    const viewSavedData = JSON.parse(sessionStorage.getItem('PATIENT_RECORD_VIEW_PATIENT_SESSION_STORAGE') || '{}');
    if (viewSavedData?.patientId) {
      this.viewPatientId = ' - Patient ID: ' + viewSavedData.patientId;
      this.disableViewTab = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.getPatientRecords();
    if (this.patientNameInput) {
      this.patientNameInput.nativeElement.focus();
    }
  }

  openDialog(action: string, employee: Employee | any) {

  }

  setEditTabPatientId(patientId: string) {
    this.editPatientId = ' - Patient ID: ' + patientId;
  }

  setViewTabPatientId(patientId: string) {
    this.viewPatientId = ' - Patient ID: ' + patientId;
  }

  applyFilter() {
    this.paginator.pageIndex = 0; // Reset to first page
    this.getPatientRecords();
  }

  performSearch(searchValue: string) {
    this.getPatientRecords();
  }

  getPatientRecords(): void {
    if (this.sort.sortChange == undefined || this.paginator.page == undefined) {
      return;
    }

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          // tslint:disable-next-line - Disables all
          return this.patientRecordService!.getPatientRecords(
            {
              search: this.searchQuery,
              filterBy: this.selectedFilterBy
            },
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex
          );
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.isError = false;
          this.resultsLength = data.data.totalCount;

          return data.data.items;
        }),
        catchError((err: any) => {
          this.toastR.error(err.error?.message || 'Failed to load patient records', 'Error');

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: PatientRecords[]) => (this.data = data));
  }

  deletePatientRecord(patientId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        patientId: patientId
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.patientRecordService.deletePatientRecord(patientId).subscribe({
          next: (response: any) => {
            this.toastR.success(response.message, 'Success');
            this.getPatientRecords();
          },
          error: (error) => {
            this.toastR.error(error.error.message, 'Error');
          }
        });
      }
    });
  }
}
