import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {Brand} from "../models/brand";
import {BrandsService} from "../brands.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-edit-brand',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule
  ],
  templateUrl: './edit-brand.component.html',
  styleUrl: './edit-brand.component.scss'
})
export class EditBrandComponent implements OnChanges, AfterViewInit {

  @Input() brand: Brand;
  @Input() currentTabIndex: number;
  brandForm: UntypedFormGroup | any;

  constructor(private fb: FormBuilder, private brandsService: BrandsService, private toastR: ToastrService) {
    this.brandForm = fb.group({
      brandId: ['', [Validators.required]],
      brandName: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brand'] && changes['brand'].currentValue) {
      if (this.currentTabIndex == 2) {
        this.brandForm.patchValue({
          brandId: this.brand.brandId ? this.brand.brandId : undefined,
          brandName: this.brand.brandName ? this.brand.brandName.toUpperCase() : ''
        });
      }
    }
  }

  updateBrand() {
    this.brandsService.updateBrand(this.brandForm.value).subscribe({
      next: data => {
        if (data.statusCode === 200) {
          this.toastR.success(data.message, 'Success');
          // Clear the form
          this.brandForm.reset();

          this.brandsService.setTabIndex(0); // Switch back to the list tab
        } else {
          this.toastR.error(data.message, 'Error');
        }
      },
      error: error => {
        this.toastR.error('Failed to update brand', 'Error');
      }
    });
  }
}
