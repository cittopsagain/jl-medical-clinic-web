import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Medicine} from "../models/medicine";
import {AsyncPipe, UpperCasePipe} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from "@angular/material/autocomplete";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-view-medicine',
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
  templateUrl: './view-medicine.component.html',
  styleUrl: './view-medicine.component.scss'
})
export class ViewMedicineComponent implements OnChanges {

  medicineForm: UntypedFormGroup | any;
  @Input() medicine: Medicine;
  @Input() currentTabIndex: number;

  constructor(private fb: FormBuilder) {
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['medicine'] && changes['medicine'].currentValue) {
      if (this.currentTabIndex == 3) {
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
}
