import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {UpperCasePipe} from "@angular/common";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MedicineService} from "./medicine.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {interval, merge, of as observableOf, Subscription} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
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
    AddMedicineComponent
  ],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss'
})
export class MedicineComponent implements OnDestroy {

  selectedTabIndex: number = 0;
  selectedMedicine: Medicine;
  displayedColumns: string[] = ['number', 'productName', 'unit', 'dosage', 'action'];
  data: Medicine[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  pageSize = 30;
  errorMessage: string = 'Problem loading data. Please try again later.';

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  private refreshSubscription: Subscription;

  constructor(private medicineService: MedicineService, private toastR: ToastrService) {

  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
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
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.medicineService.getMedicine({
            medicineName: this.medicineNameInput.nativeElement.value,
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
  }

  onClickTab(selectedTabIndex: number) {

  }
}
