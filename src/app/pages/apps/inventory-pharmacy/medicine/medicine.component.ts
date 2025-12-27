import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UpperCasePipe} from "@angular/common";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MedicineService} from "./medicine.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {interval, merge, of as observableOf, Subject, Subscription} from "rxjs";
import {catchError, map, startWith, switchMap, takeUntil} from "rxjs/operators";
import {MatIconButton} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TablerIconComponent} from "angular-tabler-icons";
import {ToastrService} from "ngx-toastr";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {EditMedicineComponent} from "./edit-medicine/edit-medicine.component";
import {Medicine} from "./models/medicine";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {AddMedicineComponent} from "./add-medicine/add-medicine.component";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {ViewMedicineComponent} from "./view-medicine/view-medicine.component";

@Component({
  selector: 'app-medicine',
  imports: [
    MatCard,
    MatCardContent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatInput,
    MatLabel,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    ReactiveFormsModule,
    FormsModule,
    MatHeaderCellDef,
    MatIconButton,
    TablerIconComponent,
    UpperCasePipe,

    MatTabGroup,
    MatTab,
    EditMedicineComponent,
    MatProgressSpinner,
    AddMedicineComponent,
    MatOption,
    MatSelect,
    ViewMedicineComponent
  ],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss'
})
export class MedicineComponent implements OnDestroy, OnInit {

  selectedTabIndex: number = 0;
  selectedMedicine: Medicine;
  displayedColumns: string[] = ['number', 'productName', 'unit', 'dosage', 'action'];
  data: Medicine[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  pageSize = 30;
  disableEditMedicineTab: boolean = true;
  disableViewMedicineTab: boolean = true;
  errorMessage: string = 'Problem loading data. Please try again later.';
  filter: any[] = [
    {
      name: 'Brand Name',
      value: 'brand_name'
    },
    {
      name: 'Generic Name',
      value: 'product_name'
    }
  ];
  selectedFilter: string = 'brand_name';
  private destroy$ = new Subject<void>();

  editMedicine: string = 'Edit Medicine';
  viewMedicine: string = 'View Medicine';
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  private refreshSubscription: Subscription;

  constructor(private medicineService: MedicineService, private toastR: ToastrService) {

  }

  ngOnInit(): void {
    this.medicineService.medicineRecordTabBehaviorObservable$.pipe(takeUntil(this.destroy$)).subscribe((tabIndex: number) => {
      if (tabIndex !== null) {
        this.selectedTabIndex = tabIndex;
        this.editMedicine = 'Edit Medicine';
        this.disableEditMedicineTab = true;
        this.getMedicine();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (this.medicineNameInput) {
      this.medicineNameInput.nativeElement.focus();
    }
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.getMedicine();

    this.refreshSubscription = interval(10000).subscribe(() => {
      this.getMedicine();
    });
  }

  applyFilter() {
    this.paginator.pageIndex = 0; // Reset to first page
    this.getMedicine();
  }

  getMedicine(){
    if (!this.medicineNameInput) {
      return;
    }

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.medicineService.getMedicine({
            medicineName: this.medicineNameInput.nativeElement.value,
            filterBy: this.selectedFilter
          }, this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.isError = false;
          this.resultsLength = data.data.totalCount;

          return data.data.items;
        }),
        catchError((error: any) => {
          this.paginator.pageIndex = 0;
          this.toastR.error(error.error?.message || 'Failed to load medicines', 'Error');

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Medicine[]) => (this.data = data));
  }

  onEditMedicine(row: any) {
    this.selectedTabIndex = 2;
    this.selectedMedicine = row;
    this.disableEditMedicineTab = false;

    this.editMedicine = 'Edit Medicine - ' + (row?.brandName ? row.brandName : '') + ' - ' +
    (row.genericName && row.genericName.length > 20 ? row.genericName.slice(0, 20) + '...' : row.genericName);
  }

  onViewMedicine(row: any) {
    this.selectedTabIndex = 3;
    this.selectedMedicine = row;
    this.disableViewMedicineTab = false;

    this.viewMedicine = 'View Medicine - ' + (row?.brandName ? row.brandName : '') + ' - ' +
    (row.genericName && row.genericName.length > 20 ? row.genericName.slice(0, 20) + '...' : row.genericName);
  }

  onClickTab(selectedTabIndex: number) {

  }
}
