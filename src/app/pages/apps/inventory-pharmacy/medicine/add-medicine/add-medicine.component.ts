import {Component, OnInit} from '@angular/core';
import {AsyncPipe, UpperCasePipe} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from "@angular/material/autocomplete";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormBuilder, FormControl, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {GroupedBrand} from "../models/brand.type";
import {MedicineService} from "../medicine.service";
import {ToastrService} from "ngx-toastr";
import {map, startWith} from "rxjs/operators";
import {Brand} from "../models/brand";
import {Unit} from "../models/unit";

@Component({
  selector: 'app-add-medicine',
  imports: [
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatButton,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatOptgroup,
    MatOption,
    ReactiveFormsModule,
    UpperCasePipe
  ],
  templateUrl: './add-medicine.component.html',
  styleUrl: './add-medicine.component.scss'
})
export class
AddMedicineComponent implements OnInit {

  medicineForm: UntypedFormGroup | any;
  groupedBrandObservable: Observable<GroupedBrand[]>;
  unitNameObservable: Observable<Unit[]>;
  private units: Unit[] = [];
  private brands: Brand[] = [];
  private groupedBrands: GroupedBrand[] = [];

  constructor(private medicineService: MedicineService, private toastR: ToastrService, private fb: FormBuilder) {
    this.medicineForm = fb.group({
      brandId: ['', Validators.required],
      brandName: ['', Validators.required],
      genericName: ['', Validators.required],
      unitId: ['', Validators.required],
      unitName: ['', Validators.required],
      dosage: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getBrands();
  }

  saveMedicine() {
    if (this.medicineForm.valid) {
      const brandName = this.medicineForm.value.brandName;
      const unitName = this.medicineForm.value.unitName;
      const brandExists = this.brands.some(brand => brand.brandName.toLowerCase() === brandName.toLowerCase());
      const unitExists = this.units.some(unit => unit.unitName.toLowerCase() === unitName.toLowerCase());

      if (!brandExists) {
        this.toastR.warning('Brand not found in the list', 'Invalid Input');
        return;
      }

      if (!unitExists) {
        this.toastR.warning('Unit not found in the list', 'Invalid Input');
        return;
      }

      this.medicineService.saveMedicine(this.medicineForm.value).subscribe({
        next: data => {
          if (data.statusCode === 201) {
            this.toastR.success(data.message, 'Success');
            // Clear the form
            this.medicineForm.reset();
          } else {
            this.toastR.error(data.message, 'Error');
          }
        },
        error: error => {
          this.toastR.error('Failed to save medicine', 'Error');
        }
      });
    }
  }

  onBrandSelected(brandName: string) {
    const brand = this.brands.find(brand => brand.brandName === brandName);
    const brandId = brand ? brand.brandId : -1;

    if (brandId === -1) {
      this.toastR.warning('Brand not found in the list', 'Invalid Input');

      return;
    }
    this.medicineForm.patchValue({
      brandId: brandId,
      brandName: brandName
    });
  }

  onUnitSelected(unitName: string) {
    const unit = this.units.find(unit => unit.unitName.toLowerCase() === unitName.toLowerCase());
    const unitId = unit ? unit.unitId : -1;

    if (unitId === -1) {
      this.toastR.warning('Unit not found in the list', 'Invalid Input');

      return;
    }

    this.medicineForm.patchValue({
      unitId: unitId,
      unitName: unitName
    });
  }

  getBrands() {
    // Reset the unit array
    this.units = [];
    this.medicineService.getBrands().subscribe({
      next: data => {
        this.units = data.data.units;
        this.brands = data.data.brands;

        this.groupedBrands = this.groupedBrandsByFirstLetter(data.data.brands);

        this.setBrandFilter();
        this.setUnitFilter();
      },
      error: error => {
        this.toastR.error(error.error?.message || 'Failed to load brands', 'Error');
      }
    });
  }

  groupedBrandsByFirstLetter(data: Brand[]): GroupedBrand[] {
    const grouped = data.reduce<Record<string, GroupedBrand>>(
      (acc, item) => {
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

    return Object.values(grouped).sort(
      (a, b) => a.letter.localeCompare(b.letter)
    );
  }

  setBrandFilter() {
    this.groupedBrandObservable = (this.medicineForm.get('brandName') as FormControl)
      .valueChanges.pipe(
        startWith(''),
        map((value: string) => this.filterGroupedBrand(value || ''))
      );
  }

  setUnitFilter() {
    this.unitNameObservable = (this.medicineForm.get('unitName') as FormControl)
      .valueChanges.pipe(
      startWith(''),
      map((value: string) => this.filterUnitName(value || ''))
    );
  }

  private filterGroupedBrand(name: string): GroupedBrand[] {
    if (name) {
      const filteredGroups = this.groupedBrands
          .map((group) => ({
            letter: group.letter,
            names: filter(group.names, name),
          }))
          .filter((group) => group.names.length > 0);

      if (filteredGroups.length <= 0) {
        this.toastR.warning('Brand not found in the list', 'Invalid Input');
        return [];
      }

      return filteredGroups;
    }

    return this.groupedBrands;
  }

  private filterUnitName(value: string): Unit[] {
    const filterValue = value.toLowerCase();

    const result =  this.units.filter((option: any) =>
      option.unitName.toLowerCase().includes(filterValue)
    );
    if (result.length <= 0) {
      this.toastR.warning('Unit not found in the list', 'Invalid Input');
      return [];
    }

    return result;
  }
}

export const filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter((item) => item.toLowerCase().includes(filterValue));
};
