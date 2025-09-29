import {Component, ElementRef, ViewChild} from '@angular/core';
import {MedicineService} from "../../../medicine/medicine.service";
import {ToastrService} from "ngx-toastr";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {AsyncPipe, UpperCasePipe} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from "@angular/material/autocomplete";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from "@angular/material/core";
import {ItemsService} from "../items/items.service";
import {Medicine} from "../../../medicine/models/medicine";

@Component({
  selector: 'app-details',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatInput,
    MatLabel,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    TablerIconComponent,
    UpperCasePipe,
    MatFormField,
    MatHeaderCellDef,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    ReactiveFormsModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  detailForm: UntypedFormGroup | any;

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  pageSize = 30;
  medicineName: string;
  data: Medicine[] = [];
  items: any[] = [];
  selectedMedicine: Medicine;

  displayedColumns: string[] = ['number', 'productName', 'unit'];

  constructor(private medicineService: MedicineService, private toastR: ToastrService,
              private _formBuilder: FormBuilder, private fb: UntypedFormBuilder, private itemsService: ItemsService) {
    this.detailForm = this.fb.group({
      brandName: ['', Validators.required],
      medicineName: ['', Validators.required],
      medicineId: [''],
      unitId: [''],
      unit: ['', Validators.required],
      batchNo: [''],
      quantity: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
      free: ['', Validators.min(0)],
      lotNumber: ['', Validators.required],
      expiryDate: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    if (this.medicineNameInput) {
      this.medicineNameInput.nativeElement.focus();
    }
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.getMedicine();
  }

  applyFilter() {
    this.paginator.pageIndex = 0; // Reset to first page
    this.getMedicine();
  }

  getMedicine() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.medicineService.getMedicine({
            medicineName: this.medicineName
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

  onRowClick(row: any) {
    this.detailForm.patchValue({
      brandName: row.brandName,
      medicineName: row.genericName,
      medicineId: row.medicineId,
      unitId: row.unitId,
      unit: row.unitName == null ? '' : row.unitName.toUpperCase()
    });
  }

  addToItems() {
    if (this.detailForm.valid) {
      this.detailForm.patchValue({
        expiryDate: this.formatExpiryDate(this.detailForm.value.expiryDate)
      })
      this.itemsService.setItems(this.detailForm.value);
      this.detailForm.reset();
    }
  }

  private formatExpiryDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  }
}
