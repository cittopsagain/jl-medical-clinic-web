import {Component, ElementRef, ViewChild} from '@angular/core';
import {StockAdjustmentService} from "../stock-adjustment.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Products} from "../../../sales/pos/pos.service";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {DatePipe, NgIf} from "@angular/common";
import {MatCard, MatCardContent} from "@angular/material/card";
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
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {MatRadioButton, MatRadioChange, MatRadioGroup} from "@angular/material/radio";
import {MatButton} from "@angular/material/button";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-stock-adjustment-list',
  imports: [
    DatePipe,
    MatCard,
    MatCardContent,
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
    MatHeaderCellDef,
    MatDivider,
    MatRadioGroup,
    MatRadioButton,
    MatButton,
    NgIf
  ],
  templateUrl: './stock-adjustment-list.component.html',
  styleUrl: './stock-adjustment-list.component.scss'
})
export class StockAdjustmentListComponent {
  productForm: UntypedFormGroup | any;
  productName: string;

  data: Products[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  pageSize = 30;

  selectedBrandName: string;
  selectedProductName: string;

  currentQuantityOnHand: number = 0;
  newQuantityOnHand: string = '0';
  currentSellingPrice: number = 0;
  newSellingPrice: string = '0';
  adjustmentReason: string = '';

  adjustmentType: string = '';
  adjustmentTypeGroup: any;

  selectedRow: any = null;

  @ViewChild('stockAdjustmentProductNameInput') stockAdjustmentProductNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  displayedColumns: string[] = ['productName', 'qtyOnHand', 'sellingPrice', 'expiryDate'];

  constructor(private stockAdjustmentService: StockAdjustmentService, private fb: UntypedFormBuilder, private toastr: ToastrService) {

  }

  ngAfterViewInit() {
    if (this.stockAdjustmentProductNameInput) {
      this.stockAdjustmentProductNameInput.nativeElement.focus();
    }

    this.getProducts();
  }

  applyFilter() {
    this.getProducts();
  }

  getProducts() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.stockAdjustmentService.getProducts(
            {
              productName: this.productName
            },
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex
          );
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.isError = false;
          this.resultsLength = data.data.totalCount;

          return data.data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Products[]) => (this.data = data));
  }

  onAdjustmentTypeChange(event: MatRadioChange) {
    this.adjustmentType = event.value;
  }

  getProductDetailsById(row: Products) {
    this.selectedRow = row;
    console.log(row);

    // Reset the values if the user selects a different product
    if (row.brandName !== this.selectedBrandName && row.productName !== this.selectedBrandName) {
      this.newSellingPrice = '0';
      this.newQuantityOnHand = '0';
    }

    this.selectedBrandName = row.brandName;
    this.selectedProductName = row.productName;
    this.currentQuantityOnHand = row.qtyOnHand;
    this.currentSellingPrice = row.sellingPrice;
  }

  clear() {
    this.selectedBrandName = '';
    this.selectedProductName = '';
    this.currentQuantityOnHand = 0;
    this.newQuantityOnHand = '0';
    this.currentSellingPrice = 0;
    this.newSellingPrice = '0';
    this.adjustmentType = '';
    this.selectedRow = null;
    this.adjustmentReason = '';

    this.adjustmentTypeGroup = null;
  }

  checkValue() {
    this.newQuantityOnHand = (Number(this.newQuantityOnHand) * 1).toString(); // Remove leading zeros, if the user will input 0000, it will be converted to 0
    this.newSellingPrice = (Number(this.newSellingPrice) * 1).toString(); // Remove leading zeros, if the user will input 0000, it will be converted to 0

    if (isNaN(Number(this.newQuantityOnHand))) {
      // Handle invalid input
      this.newQuantityOnHand = '0';
    }

    if (isNaN(Number(this.newSellingPrice))) {
      // Handle invalid input
      this.newSellingPrice = '0';
    }
  }

  updateInventory() {
    this.stockAdjustmentService.updateInventory({
      brandId: this.selectedRow.brandId,
      productId: this.selectedRow.productId,
      qtyOnHand: this.selectedRow.qtyOnHand,
      newQtyOnHand: this.newQuantityOnHand,
      sellingPrice: this.selectedRow.sellingPrice,
      newSellingPrice: this.newSellingPrice,
      adjustmentReason: this.adjustmentReason,
      adjustmentType: this.adjustmentType
    }).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message, 'Success!');
        this.getProducts();
        if (this.adjustmentType == 'qty') {
          this.selectedRow.qtyOnHand = this.newQuantityOnHand;
          this.currentQuantityOnHand = this.selectedRow.qtyOnHand;
        }

        if (this.adjustmentType == 'price') {
          this.selectedRow.sellingPrice = this.newSellingPrice;
          this.currentSellingPrice = this.selectedRow.sellingPrice;
        }
        this.adjustmentReason = '';
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Oops!');
      }
    });
    console.log(this.selectedRow);
  }
}
