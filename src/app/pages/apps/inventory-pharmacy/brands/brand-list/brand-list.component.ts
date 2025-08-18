import {Component, ElementRef, ViewChild} from '@angular/core';
import {Brands, BrandsApi, BrandsService} from "../brands.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge, Observable, of as observableOf} from "rxjs";
import {PatientRecords} from "../../../patient-management/patient-records/patient-records.service";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {RouterLink} from "@angular/router";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";

@Component({
  selector: 'app-brand-list',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinner,
    RouterLink,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatSort,
    MatTable,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator
  ],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss'
})
export class BrandListComponent {

  @ViewChild('brandNameInput') brandNameInput: ElementRef;

  displayedColumns: string[] = ['number', 'brandName'];
  data: Brands[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isError = false;

  pageSize = 30;

  brandName: string;

  errorMessage: string = 'Problem loading data. Please try again later.';

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  constructor(private brandsService: BrandsService) {

  }

  ngAfterViewInit() {
    if (this.brandNameInput) {
      this.brandNameInput.nativeElement.focus();
    }
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.getBrands();
  }

  applyFilter() {
    this.getBrands();
  }

  getBrands() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.brandsService!.getBrands({
            brandName: this.brandName
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
          }

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Brands[]) => (this.data = data));
  }

}
