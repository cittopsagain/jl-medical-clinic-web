import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {HttpClient} from "@angular/common/http";
import {merge, Observable, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {CommonModule, DatePipe} from "@angular/common";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {TablerIconsModule} from "angular-tabler-icons";
import {MatDividerModule} from "@angular/material/divider";
import {PatientRecords, PatientRecordsService} from "./patient-records.service";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {Employee} from "../../employee/employee";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {MatButtonLoading} from "@ng-matero/extensions/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AppConfirmDeleteDialogComponent} from "../../invoice/invoice-list/confirm-delete-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDeleteDialogComponent} from "./confirm-delete-dialog/confirm-delete-dialog.component";

@Component({
  selector: 'app-patient-records',
  imports: [
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    DatePipe,
    CommonModule,
    TablerIconsModule,
    MatSortModule,
    MatDividerModule,
    MatButton,
    MatInput,
    MatSuffix,
    MatFormField,
    MatIcon,
    MatButtonLoading,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatIconButton
  ],
  templateUrl: './patient-records.component.html',
  styleUrl: './patient-records.component.scss'
})
export class PatientRecordsComponent {
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

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  // tslint:disable-next-line - Disables all
  constructor(private patientRecordService: PatientRecordsService, private router: Router, private toastr: ToastrService,
              private dialog: MatDialog) {}

  ngOnInit(): void {
    // Wait 300ms after typing stops before searching
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
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

  /*applyFilter(searchValue: string): void {
    this.searchSubject.next(searchValue);
  }*/

  applyFilter() {
    this.paginator.pageIndex = 0; // Reset to first page
    this.getPatientRecords();
  }

  performSearch(searchValue: string) {
    this.getPatientRecords();
  }

  getPatientRecords(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          // tslint:disable-next-line - Disables all
          return this.patientRecordService!.getPatientRecords(
            {
              patientName: this.patientName,
              address: this.address
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
          this.toastr.error(err.error?.message || 'Failed to load patient records', 'Error');

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: PatientRecords[]) => (this.data = data));
  }

  deletePatientRecord(patientId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.patientRecordService.deletePatientRecord(patientId).subscribe({
          next: (response: any) => {
            this.toastr.success(response.message, 'Success');
            this.getPatientRecords();
          },
          error: (error) => {
            this.toastr.error(error.error.message, 'Error');
          }
        });
      }
    });
  }
}
