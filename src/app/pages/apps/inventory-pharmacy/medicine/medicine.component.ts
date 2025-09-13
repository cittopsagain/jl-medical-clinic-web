import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AsyncPipe, DecimalPipe, UpperCasePipe} from "@angular/common";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {Medicine, MedicineService} from "./medicine.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge, Observable, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {MatButton, MatIconButton} from "@angular/material/button";
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
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {TablerIconComponent} from "angular-tabler-icons";
import {ToastrService} from "ngx-toastr";
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from "@angular/material/autocomplete";

@Component({
  selector: 'app-medicine',
  imports: [
    DecimalPipe,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatButton,
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
    RouterLink,
    MatHeaderCellDef,
    MatIconButton,
    TablerIconComponent,
    MatCardHeader,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOptgroup,
    MatOption,
    UpperCasePipe
  ],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss'
})
export class MedicineComponent implements OnInit {

  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  @ViewChild('unitNameInput') unitNameInput: ElementRef;
  @ViewChild('dosageInput') dosageInput: ElementRef;

  displayedColumns: string[] = ['number', 'productName', 'unit', 'dosage', 'action'];
  data: Medicine[] = [];
  brand: Brand[] = [];
  unit: string[] = [];
  unitObjects: Unit[] = [];

  selectedMedicine: Medicine;

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  pageSize = 30;

  medicineName: string;
  errorMessage: string = 'Problem loading data. Please try again later.';
  buttonLabel: string = 'Save Medicine';

  selectedBrandName: string = '';
  selectedUnitName: string = '';

  readonlyPlaceholder: boolean = true;

  brandGroups: GroupedBrands[] = [];
  brandGroupOptions: Observable<GroupedBrands[]>;
  brandForm = this._formBuilder.group({
    brandGroup: ['', Validators.required],
    productName: ['', Validators.required],
    unitName: ['', Validators.required],
    dosage: ['', Validators.required]
  });

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  filteredOptions: Observable<string[]>;

  constructor(private medicineService: MedicineService, private toastR: ToastrService, private _formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.getBrands();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    // Reset every time user types something
    this.selectedUnitName = '';

    const result =  this.unit.filter((option: any) =>
      option.toLowerCase().includes(filterValue)
    );
    if (result.length <= 0) {
      this.toastR.warning('Unit not found in the list', 'Invalid Input');
      return [];
    }

    return result;
  }

  private _filterGroup(value: string): GroupedBrands[] {
    this.selectedBrandName = ''; // Reset the selected Brand Name when filtering

    if (value) {
      const filteredGroups = this.brandGroups
        .map((group) => ({
          letter: group.letter,
          names: _filter(group.names, value),
        }))
        .filter((group) => group.names.length > 0);

      if (filteredGroups.length <= 0) {
        this.toastR.warning('Brand not found in the list', 'Invalid Input');

        // this.brandForm.get('brandGroup')!.setValue('');

        return [];
      }

      return filteredGroups;
    }

    return this.brandGroups;
  }

  onBrandSelected(brandName: string) {
    this.selectedBrandName = brandName;
  }

  onUnitSelected(unitName: string) {
    this.selectedUnitName = unitName;
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

  getBrands() {
    this.medicineService.getBrands().subscribe({
      next: data => {
        this.brand = data.data.brands;
        this.unitObjects = data.data.units;

        for (let i = 0; i < data.data.units.length; i++) {
          this.unit.push(data.data.units[i].unitName.toUpperCase());
        }

        this.brandGroups = this.groupByFirstLetter(data.data.brands);

        // Brands
        this.setBrandFilter();

        // Units
        this.setUnitNameFilter();
      },
      error: error => {
        this.toastR.error(error.error.message, 'Oops!');
      }
    });
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
          if (error.error.message != undefined) {
            this.errorMessage = error.error.message;
            this.paginator.pageIndex = 0;
          }

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Medicine[]) => (this.data = data));
  }

  saveMedicine() {
    const found = this.brand.find(b => b.brandName.toLowerCase() === this.selectedBrandName.toLowerCase());
    const brandId = found ? found.brandId : undefined;

    const params = {
      productName: this.brandForm.value.productName,
      brandId: brandId,
      unitId: this.unitObjects.find(u => u.unitName.toLowerCase() === this.selectedUnitName.toLowerCase())?.unitId,
      dosage: this.brandForm.value.dosage
    };

    if (this.buttonLabel == 'Update Medicine' && this.brandForm.valid) {
      this.medicineService.updateMedicine({
        ...params, productId: this.selectedMedicine.productId
      }).subscribe({
        next: data => {
          if (data.statusCode == 200) {
            this.toastR.success(data.message, 'Success!');
            // Clear the form
            this.brandForm.reset();
            this.selectedBrandName = '';
            this.selectedUnitName = '';

            // Refresh the table
            this.getMedicine();
          } else {
            this.toastR.error(data.message);
          }
        },
        error: error => {
          console.log(error);
        }
      });
    }

    if (this.buttonLabel == 'Save Medicine' && this.brandForm.valid) {
      this.medicineService.saveMedicine(params).subscribe({
        next: data => {
          if (data.statusCode === 201) {
            this.toastR.success(data.message, 'Success!');
            // Clear the form
            this.brandForm.reset();
            this.selectedBrandName = '';
            this.selectedUnitName = '';

            // Refresh the table
            this.getMedicine();
          } else {
            this.toastR.error(data.message, 'Oops!');
          }
        },
        error: error => {
          console.log(error);
        }
      });
    }
  }

  groupByFirstLetter(data: Brand[]): GroupedBrands[] {
    const grouped = data.reduce<Record<string, GroupedBrands>>((acc, item) => {
      const firstLetter = item.brandName[0].toUpperCase();

      if (!acc[firstLetter]) {
        acc[firstLetter] = { letter: firstLetter, names: [] };
      }

      // Only add the brand name if it doesn't already exist in the array
      if (!acc[firstLetter].names.includes(item.brandName)) {
        acc[firstLetter].names.push(item.brandName);
      }
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.letter.localeCompare(b.letter));
  }

  setUnitNameFilter() {
    this.filteredOptions = this.brandForm
      .get('unitName')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  setBrandFilter() {
    this.brandGroupOptions = this.brandForm
      .get('brandGroup')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filterGroup(value || ''))
      );
  }

  removeUnitNameReadonly() {
    this.unitNameInput.nativeElement.removeAttribute('readonly');
  }

  addUnitNameReadonly() {
    this.unitNameInput.nativeElement.setAttribute('readonly', 'true');
    this.filteredOptions = new Observable<string[]>(); // Clear the filtered options
  }

  editMedicine(row: any) {
    this.setUnitNameFilter();

    this.brandForm.patchValue({
      brandGroup: row.brandName,
      productName: row.productName,
      unitName: row.unitName != null ? row.unitName.toUpperCase() : '',
      dosage: row.dosage
    });

    this.readonlyPlaceholder = true;
    this.selectedBrandName = row.brandName;
    this.selectedUnitName = row.unitName;

    if (row.unitName == null) {
      this.removeUnitNameReadonly();
    } else {
      this.addUnitNameReadonly();
    }

    // Remove the dosage readonly attribute
    this.dosageInput.nativeElement.removeAttribute('readonly');
    this.dosageInput.nativeElement.focus();

    this.selectedMedicine = row;
  }

  addMedicine() {
    this.buttonLabel = 'Save Medicine';
    this.readonlyPlaceholder = false;
    this.brandForm.reset();
    this.selectedBrandName = '';
    this.selectedUnitName = '';

    this.setUnitNameFilter();
  }
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter((item) => item.toLowerCase().includes(filterValue));
};

type Brand = {
  brandId: number;
  brandName: string;
};

type Unit = {
  unitId: number;
  unitName: string;
};

type GroupedBrands = {
  letter: string;
  names: string[];
};
