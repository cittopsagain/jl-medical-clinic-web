import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Brand} from "../models/brand";
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";

@Component({
  selector: 'app-view-brand',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule
  ],
  templateUrl: './view-brand.component.html',
  styleUrl: './view-brand.component.scss'
})
export class ViewBrandComponent implements OnChanges, AfterViewInit {

  @Input() brand: Brand;
  @Input() currentTabIndex: number;
  brandForm: UntypedFormGroup | any;

  constructor(private fb: FormBuilder) {
    this.brandForm = fb.group({
      brandName: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brand'] && changes['brand'].currentValue) {
      if (this.currentTabIndex == 3) {
        this.brandForm.patchValue({
          brandName: this.brand.brandName ? this.brand.brandName.toUpperCase() : ''
        });
      }
    }
  }

}
