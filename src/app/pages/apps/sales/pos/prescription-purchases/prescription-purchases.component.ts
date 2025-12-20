import {Component, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Patient, PosService} from "../pos.service";
import {ToastrService} from "ngx-toastr";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {MatCard, MatCardContent} from "@angular/material/card";
import {FormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {DatePipe} from "@angular/common";
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-prescription-purchases',
  imports: [
    MatCard,
    MatCardContent,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatFormField,
    MatOption,
    MatSelect,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    MatHeaderCellDef,
    DatePipe,
    MatPaginator,
    MatDivider
  ],
  templateUrl: './prescription-purchases.component.html',
  styleUrl: './prescription-purchases.component.scss'
})
export class PrescriptionPurchasesComponent {

  data: Patient[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  selectedFilter: string = 'patient_name';
  searchName: string = '';

  displayedColumns = ['posId', 'patientId', 'patientName', 'customerOrderType', 'totalAmount', 'dateCreated'];
  displayedPurchasedMedicinesColumns = ['medicineName', 'qty', 'sellingPrice'];

  purchasedMedicines: any[] = [];
  selectedPosHeader: any;

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

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  constructor(private posService: PosService, private toastR: ToastrService) {

  }

  ngAfterViewInit() {
    this.getPatientsTransactions();
  }

  applyFilter() {
    this.getPatientsTransactions();

  }

  getPatientsTransactions() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.posService.getPatientsTransactions(
            {
              search: this.searchName,
              filterBy: this.selectedFilter
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
        catchError((error: any) => {
          this.toastR.error(error.error?.message || 'Failed to load patient transactions', 'Error');

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      ).subscribe((data: Patient[]) => (this.data = data));
  }

  getPurchaseDetail(row: any) {
    this.selectedPosHeader = row;

    this.posService.getPurchaseDetail(row.posId).subscribe({
      next: (response: any) => {
        this.purchasedMedicines = response.data;
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }
}
