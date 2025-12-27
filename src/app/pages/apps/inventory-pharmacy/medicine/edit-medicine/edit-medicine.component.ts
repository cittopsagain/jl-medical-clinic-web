import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MedicineService} from "../medicine.service";
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormControl, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import {Medicine} from "../models/medicine";
import {Observable} from "rxjs";
import {GroupedBrand} from "../models/brand.type";
import {Unit} from "../models/unit";
import {Brand} from "../models/brand";
import {map, startWith} from "rxjs/operators";
import {AsyncPipe, UpperCasePipe} from "@angular/common";

@Component({
  selector: 'app-edit-medicine',
  imports: [
    MatCard,
    MatCardContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOptgroup,
    MatOption,
    MatInput,
    ReactiveFormsModule,
    AsyncPipe,
    UpperCasePipe
  ],
  templateUrl: './edit-medicine.component.html',
  styleUrl: './edit-medicine.component.scss'
})
export class EditMedicineComponent implements OnChanges, AfterViewInit {

  medicineForm: UntypedFormGroup | any;
  @Input() medicine: Medicine;
  @Input() currentTabIndex: number;
  groupedBrandObservable: Observable<GroupedBrand[]>;
  unitNameObservable: Observable<Unit[]>;
  private units: Unit[] = [];
  private brands: Brand[] = [];
  private groupedBrands: GroupedBrand[] = [];

  constructor(private medicineService: MedicineService, private toastR: ToastrService, private fb: FormBuilder) {
    this.medicineForm = fb.group({
      medicineId: ['', [Validators.required]],
      genericName: ['', Validators.required],
      unitId: ['', Validators.required],
      unitName: ['', Validators.required],
      brandId: ['', Validators.required],
      brandName: ['', Validators.required],
      dosage: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.getBrands();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['medicine'] && changes['medicine'].currentValue) {
      if (this.currentTabIndex == 2) {
        this.medicineForm.patchValue({
          medicineId: this.medicine.medicineId,
          genericName: this.medicine.genericName,
          unitId: this.medicine.unitId,
          unitName: this.medicine.unitName ? this.medicine.unitName.toUpperCase() : '',
          brandId: this.medicine.brandId,
          brandName: this.medicine.brandName,
          dosage: this.medicine.dosage
        });
      }
    }
  }

  updateMedicine() {
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

      this.medicineService.updateMedicine(this.medicineForm.value).subscribe({
        next: data => {
          if (data.statusCode === 200) {
            this.toastR.success(data.message, 'Success');
            // Clear the form
            this.medicineForm.reset();

            this.medicineService.setTabIndex(0); // Switch back to the list tab
          } else {
            this.toastR.error(data.message, 'Error');
          }
        },
        error: error => {
          this.toastR.error('Failed to update medicine', 'Error');
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
