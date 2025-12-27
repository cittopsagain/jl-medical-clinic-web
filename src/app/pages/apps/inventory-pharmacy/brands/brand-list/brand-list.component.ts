import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Brands, BrandsService} from "../brands.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {interval, merge, of as observableOf, Subject, Subscription} from "rxjs";
import {catchError, map, startWith, switchMap, takeUntil} from "rxjs/operators";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {TablerIconComponent} from "angular-tabler-icons";
import {EditBrandComponent} from "../edit-brand/edit-brand.component";
import {ViewBrandComponent} from "../view-brand/view-brand.component";
import {MatIconButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDeleteDialogComponent} from "./confirm-delete-dialog/confirm-delete-dialog.component";

@Component({
  selector: 'app-brand-list',
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
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
    AddBrandComponent,
    TablerIconComponent,
    EditBrandComponent,
    ViewBrandComponent,
    MatIconButton
  ],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss'
})
export class BrandListComponent implements OnDestroy, OnInit {

  @ViewChild('brandNameInput') brandNameInput: ElementRef;

  selectedTabIndex: number = 0;
  displayedColumns: string[] = ['number', 'brandName', 'reference', 'action'];
  data: Brands[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  disableEditBrandTab: boolean = true;
  disableViewBrandTab: boolean = true;
  editBrand: string = 'Edit Brand';
  viewBrand: string = 'View Brand';
  selectedBrand: Brands;
  private destroy$ = new Subject<void>();

  pageSize = 30;

  brandName: string;

  errorMessage: string = 'Problem loading data. Please try again later.';

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  private refreshSubscription: Subscription;

  constructor(private brandsService: BrandsService, private toastR: ToastrService, private matDialog: MatDialog) {

  }

  ngOnInit(): void {
    this.brandsService.brandRecordTabBehaviorObservable$.pipe(takeUntil(this.destroy$)).subscribe((tabIndex: number) => {
      if (tabIndex !== null) {
        this.selectedTabIndex = tabIndex;
        this.editBrand = 'Edit Brand';
        this.disableEditBrandTab = true;
        this.getBrands();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
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
    if (!this.brandNameInput) {
      return;
    }

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
          this.toastR.error(error.error?.message || 'Failed to load brands', 'Error');

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Brands[]) => (this.data = data));
  }

  onEditBrand(row: any) {
    this.selectedTabIndex = 2;

    this.editBrand = 'Edit Brand - ' + row.brandName;
    this.disableEditBrandTab = false;

    this.selectedBrand = row;
  }

  onViewBrand(row: any) {
    this.selectedTabIndex = 3;

    this.viewBrand = 'View Brand - ' + row.brandName;
    this.disableViewBrandTab = false;

    this.selectedBrand = row;
  }

  onClickTab(selectedTabIndex: number) {

  }

  deleteBrand(brand: Brands, enterAnimationDuration: string = '0ms', exitAnimationDuration: string = '0ms') {
    this.matDialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        brandName: brand.brandName
      },
      enterAnimationDuration,
      exitAnimationDuration,
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.brandsService.deleteBrand(brand.brandId).subscribe({
          next: (res) => {
            if (res.statusCode == 200) {
              this.getBrands();
              this.toastR.success(res.message, 'Success');
            } else {
              this.toastR.error(res.message, 'Error');
            }
          },
          error: (e) => {
            this.toastR.error('Failed to delete brand', 'Error');
          }
        });
      }
    });
  }
}
