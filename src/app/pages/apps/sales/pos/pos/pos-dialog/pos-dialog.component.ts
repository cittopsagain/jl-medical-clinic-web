import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {Patient, PosService} from "../../pos.service";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {catchError, filter, map, startWith, switchMap} from "rxjs/operators";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {ToastrService} from "ngx-toastr";
import {DatePipe} from "@angular/common";
import {PosComponent} from "../pos.component";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {merge, of as observableOf} from "rxjs";

@Component({
  selector: 'app-pos-dialog',
  imports: [
    MatCard,
    MatCardContent,
    MatDialogClose,
    MatDialogContent,
    MatIconButton,
    TablerIconComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    FormsModule,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatTable,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    DatePipe,
    MatSort,
    MatPaginator
  ],
  templateUrl: './pos-dialog.component.html',
  styleUrl: './pos-dialog.component.scss'
})
export class PosDialogComponent {

  selectedFilter: string = 'patient_diagnosis_id_or_patient_name';
  displayedColumns = ['visitId', 'patientId', 'prescriptionId', 'patientName', 'address', 'visitDateTime'];
  data: Patient[] = [];
  resultsLength = 0;
  @ViewChild('searchNameInput') searchNameInput: ElementRef;
  @ViewChild('filterByInput') filterByInput: MatSelect;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  filter: any[] = [
    {
      name: 'Patient Name',
      value: 'patient_name'
    },
    {
      name: 'Prescription Id',
      value: 'patient_diagnosis_id'
    },
    {
      name: 'Prescription Id OR Patient Name',
      value: 'patient_diagnosis_id_or_patient_name'
    }
  ];

  constructor(private posService: PosService, private toastR: ToastrService,
              private dialogRef: MatDialogRef<PosComponent>) {
  }

  onRowClick(row: Patient) {
    this.dialogRef.close(row);
  }

  ngAfterViewInit() {
    this.getPatientRecord();
  }

  applyFilter() {
    this.getPatientRecord();
  }

  getPatientRecord() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.posService.getPatientRecord({
            search: this.searchNameInput.nativeElement.value,
            filterBy: this.filterByInput.value == null ? 'patient_diagnosis_id' : this.filterByInput.value
          },
          this.sort.active,
          this.sort.direction,
          this.paginator.pageIndex
          )
        }),
        map((data: any) => {
          this.resultsLength = data.data.totalCount;
          console.log(this.data);

          return data.data.items;
        }),
        catchError((error: any) => {
          this.toastR.error(error.error?.message || 'Failed to load patient record', 'Error');
          return observableOf([]);
        })
      ).subscribe((data: Patient[]) => (this.data = data));
    /* this.posService.getCompletedPatientVisit({
      search: this.searchNameInput.nativeElement.value,
      filterBy: this.filterByInput.value == null ? 'patient_diagnosis_id' : this.filterByInput.value
    }).subscribe({
      next: (result: any) => {
        this.data = result.data;
      },
      error: (error) => {
        this.toastR.error('No completed patient visits found.');
      }
    }); */
  }
}
