import {Component, ElementRef, ViewChild} from '@angular/core';
import {MedicalRecordsService, Patient, PatientRecordsApi} from "./medical-records.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ToastrService} from "ngx-toastr";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {MatButton} from "@angular/material/button";
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

@Component({
  selector: 'app-medical-records',
  imports: [
    MatButton,
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
    MatPaginator
  ],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.scss'
})
export class MedicalRecordsComponent {

  displayedColumns: string[] = ['number', 'patientId', 'patientName', 'address', 'visitCount'];
  patientData: Patient[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;

  pageSize = 30;

  patientName: string;
  address: string;

  @ViewChild('patientNameInput') patientNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  constructor(private medicalRecordsService: MedicalRecordsService,
              private toastR: ToastrService,
              private router: Router) {

  }

  ngAfterViewInit() {
    if (this.patientNameInput) {
      this.patientNameInput.nativeElement.focus();
    }

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    if (this.patientName == undefined || this.address == undefined) {
      this.patientName = '';
      this.address = '';
    }

    this.getPatientRecords();
  }

  applyFilter() {
    this.paginator.pageIndex = 0;
    this.getPatientRecords();
  }

  getPatientRecords() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.medicalRecordsService!.getPatientRecords(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.patientName,
            this.address
          );
        }),
        map((data: any): Patient[] => {
          this.isLoadingResults = false;
          this.isError = false;
          this.resultsLength = data.data.totalCount;

          return data.data.items;
        }),
        catchError((error: any) => {
          this.toastR.error(error.error?.message || 'Failed to load medical records', 'Error');
          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      ).subscribe((data: Patient[]) => (this.patientData = data));
  }

  viewPatientDetails(row: any): void {
    this.router.navigate(['/apps/medical-records/view-patient-medical-records', row.patientId], {
      state: { patient: row }
    });
  }

}
