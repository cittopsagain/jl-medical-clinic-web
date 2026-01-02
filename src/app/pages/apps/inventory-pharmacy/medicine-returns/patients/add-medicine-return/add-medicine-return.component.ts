import {Component, ViewChild} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {Patient, PosService} from "../../../../sales/pos/pos.service";
import {ToastrService} from "ngx-toastr";
import {DatePipe} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatDivider} from "@angular/material/list";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatPaginator} from "@angular/material/paginator";
import {MatSelect} from "@angular/material/select";
import {MatSort} from "@angular/material/sort";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatButton} from "@angular/material/button";
import {MedicineReturnsService} from "../../medicine-returns.service";
import {PatientsService} from "../patients.service";

@Component({
  selector: 'app-add-medicine-return',
  imports: [
    MatCard,
    MatCardContent,
    DatePipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatDivider,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatInput,
    MatLabel,
    MatOption,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSelect,
    MatSort,
    MatTable,
    ReactiveFormsModule,
    FormsModule,
    MatHeaderCellDef,
    MatCheckbox,
    MatButton
  ],
  templateUrl: './add-medicine-return.component.html',
  styleUrl: './add-medicine-return.component.scss'
})
export class AddMedicineReturnComponent {

  data: Patient[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  selectedFilter: string = 'patient_name';
  searchName: string = '';
  reason: string = '';

  displayedColumns = ['posId', 'patientId', 'patientName', 'customerOrderType', 'totalAmount', 'dateCreated'];
  displayedPurchasedMedicinesColumns = ['medicineName', 'qty', 'sellingPrice', 'return'];

  purchasedMedicines: any[] = [];
  selectedPosHeader: any;

  isSaving: boolean = false;

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

  constructor(private posService: PosService,
              private toastR: ToastrService,
              private medicineReturnService: MedicineReturnsService,
              private patientService: PatientsService) {

  }

  ngAfterViewInit() {
    this.getLast7DaysPatientTransactions();
  }

  getLast7DaysPatientTransactions() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.posService.getLast7DaysPatientsTransactions(
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

  applyFilter() {
    this.getLast7DaysPatientTransactions();
    this.selectedPosHeader = null;
    this.purchasedMedicines = [];
    this.reason = '';
  }

  getPurchaseDetail(row: any) {
    this.selectedPosHeader = row;

    this.posService.getPurchaseDetail(row.posId).subscribe({
      next: (response: any) => {
        this.purchasedMedicines = response.data.map((medicine: any) => ({
          ...medicine,
          selected: false
        }));
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }

  isAllSelected(): boolean {
    return this.purchasedMedicines?.length > 0 &&
      this.purchasedMedicines.every(row => row.selected);
  }

  isSomeSelected(): boolean {
    const selected = this.purchasedMedicines?.filter(row => row.selected) || [];
    return selected.length > 0 && selected.length < this.purchasedMedicines.length;
  }

  toggleSelectAll(event: any): void {
    const checked = event.checked;
    this.purchasedMedicines.forEach(row => row.selected = checked);
  }

  areAllItemsReturned(): boolean {
    return this.purchasedMedicines.every(item => item.isReturned);
  }

  updateSelectAllState(save: boolean = false): void {
    if (this.hasSelectedMedicines() && this.reason != '') {
      const selectedMedicines = this.purchasedMedicines.filter(medicine => medicine.selected && !medicine.isReturned);
      const totalAmount = selectedMedicines.reduce((sum, medicine) => sum + (medicine.sellingPrice * medicine.qty), 0);

      if (save) {
        // Prevent multiple submissions while request is in progress
        if (this.isSaving) {
          this.toastR.error("Save operation is already in progress. Please wait.", 'Error');
          return;
        }

        this.isSaving = true;
        this.medicineReturnService.savePatientMedicineReturn({
          header: {
            totalAmount: totalAmount,
            reason: this.reason,
            posId: this.selectedPosHeader.posId
          },
          details: selectedMedicines
        }).subscribe({
          next: (response: any) => {
            this.isSaving = false;
            this.toastR.success(response.message, 'Success');
            this.reason = '';
            this.purchasedMedicines = [];
            this.selectedPosHeader = null;
            this.patientService.setTabIndex(0);
          },
          error: (error: any) => {
            this.isSaving = false;
            this.toastR.error(error.error.message, 'Error');
          }
        });
      }
    }
  }

  hasSelectedMedicines(): boolean {
    return this.purchasedMedicines?.some(medicine => medicine.selected) ?? false;
  }

  onReasonChange(value: string): void {
    this.reason = value.trim();
  }

}
