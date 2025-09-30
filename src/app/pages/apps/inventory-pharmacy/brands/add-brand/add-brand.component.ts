import {Component, OnDestroy} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {RouterLink} from "@angular/router";
import {BrandsService} from "../brands.service";
import {ToastrService} from "ngx-toastr";
import {AsyncPipe, UpperCasePipe} from "@angular/common";
import {FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";

@Component({
  selector: 'app-add-brand',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    RouterLink,
    AsyncPipe,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatLabel,
    MatOptgroup,
    MatOption,
    ReactiveFormsModule,
    UpperCasePipe,
    MatFormField
  ],
  templateUrl: './add-brand.component.html',
  styleUrl: './add-brand.component.scss'
})
export class AddBrandComponent {

  brandForm: UntypedFormGroup | any;

  constructor(private brandService: BrandsService, private toastR: ToastrService, private fb: FormBuilder) {
    this.brandForm = fb.group({
      brandName: ['', Validators.required]
    });
  }

  saveBrand() {
    if (this.brandForm.valid) {
      this.brandForm.value.brandName = this.brandForm.value.brandName.toUpperCase();
      this.brandService.saveBrand(this.brandForm.value).subscribe({
        next: data => {
          if (data.statusCode == 201) {
            this.toastR.success(data.message);
            this.brandForm.reset();
          } else {
            this.toastR.error(data.message, "Error");
          }
        },
        error: error => {
          this.toastR.error("Error saving brand", "Error");
        }
      });
    }
  }
}
