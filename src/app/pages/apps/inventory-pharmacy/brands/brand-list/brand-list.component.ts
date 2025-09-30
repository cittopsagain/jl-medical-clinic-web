import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Brands, BrandsApi, BrandsService} from "../brands.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {interval, merge, Observable, of as observableOf, Subscription} from "rxjs";
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
import {ToastrService} from "ngx-toastr";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {AddBrandComponent} from "../add-brand/add-brand.component";

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
    MatPaginator,
    MatTab,
    MatTabGroup,
    AddBrandComponent
  ],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss'
})
export class BrandListComponent implements OnDestroy {

  @ViewChild('brandNameInput') brandNameInput: ElementRef;

  selectedTabIndex: number = 0;
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
  private refreshSubscription: Subscription;

  constructor(private brandsService: BrandsService, private toastR: ToastrService) {

  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    if (this.brandNameInput) {
      this.brandNameInput.nativeElement.focus();
    }
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.getBrands();

    this.refreshSubscription = interval(10000).subscribe(() => {
      this.getBrands();
    });
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
          this.toastR.error(error.error?.message || 'Failed to brands', 'Error');

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Brands[]) => (this.data = data));
  }

}
