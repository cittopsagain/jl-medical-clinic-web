import {Component, ElementRef, ViewChild} from '@angular/core';
import {StockAdjustmentService} from "../stock-adjustment.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Products} from "../../../sales/pos/pos.service";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {DatePipe, NgIf, UpperCasePipe} from "@angular/common";
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
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {MatRadioButton, MatRadioChange, MatRadioGroup} from "@angular/material/radio";
import {MatButton} from "@angular/material/button";
import {ToastrService} from "ngx-toastr";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from "@angular/material/core";

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
    NgIf,
    UpperCasePipe,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix
  ],
  providers: [
    provideNativeDateAdapter()
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
  lotNumber: string;

  currentQuantityOnHand: number = 0;
  newQuantityOnHand: string = '0';
  currentSellingPrice: number = 0;
  newSellingPrice: string = '';
  adjustmentReason: string = '';

  currentLotNo: string = '';
  newLotNo: string = '';
  currentExpiryDate: string = '';
  newExpiryDate: string = '';

  adjustmentType: string = '';
  adjustmentTypeGroup: any;

  selectedRow: any = null;

  @ViewChild('stockAdjustmentProductNameInput') stockAdjustmentProductNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  displayedColumns: string[] = ['productName', 'unit', 'qtyOnHand', 'sellingPrice', 'expiryDate'];

  constructor(private stockAdjustmentService: StockAdjustmentService, private fb: UntypedFormBuilder, private toastr: ToastrService) {

  }

  ngAfterViewInit() {
    if (this.stockAdjustmentProductNameInput) {
      this.stockAdjustmentProductNameInput.nativeElement.focus();
    }

    this.getProducts();
  }

  applyFilter() {
    this.paginator.pageIndex = 0;
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
        catchError((error: any) => {
          this.toastr.error(error.error?.message || 'Failed to load products', 'Error');
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

    // Reset the values if the user selects a different product
    if (row.brandName !== this.selectedBrandName && row.productName !== this.selectedBrandName) {
      this.newSellingPrice = '';
      this.newQuantityOnHand = '';
    }

    this.selectedBrandName = row.brandName;
    this.selectedProductName = row.productName;
    this.currentQuantityOnHand = row.qtyOnHand;
    this.currentSellingPrice = row.sellingPrice;
    this.lotNumber = row.lotNumber;
    this.currentLotNo = row.lotNumber;
    this.currentExpiryDate = row.expiryDate;
  }

  clear() {
    this.selectedBrandName = '';
    this.selectedProductName = '';
    this.currentQuantityOnHand = 0;
    this.newQuantityOnHand = '';
    this.currentSellingPrice = 0;
    this.newSellingPrice = '';
    this.adjustmentType = '';
    this.selectedRow = null;
    this.adjustmentReason = '';
    this.currentLotNo = '';
    this.newLotNo = '';
    this.currentExpiryDate = '';
    this.newExpiryDate = '';

    this.adjustmentTypeGroup = null;
  }

  checkValue() {
    const qtyValue = Number(this.newQuantityOnHand);
    this.newQuantityOnHand = isNaN(qtyValue) ? '0' : qtyValue.toString();

    setTimeout(() => {
      let newSellingPrice = Number(this.newSellingPrice);
      if (isNaN(newSellingPrice)) {
        this.newSellingPrice = '';
      }
    }, 0);
  }

  updateInventory() {
    this.stockAdjustmentService.updateInventory({
      brandId: this.selectedRow.brandId,
      productHistoryId: this.selectedRow.productHistoryId,
      productId: this.selectedRow.productId,
      qtyOnHand: this.selectedRow.qtyOnHand,
      newQtyOnHand: this.newQuantityOnHand,
      sellingPrice: this.selectedRow.sellingPrice,
      newSellingPrice: this.newSellingPrice,
      lotNumber: this.lotNumber,
      newLotNumber: this.newLotNo,
      expiryDate: this.formatExpiryDate(this.selectedRow.expiryDate),
      newExpiryDate: this.formatExpiryDate(this.newExpiryDate),
      adjustmentReason: this.adjustmentReason,
      adjustmentType: this.adjustmentType
    }).subscribe({
      next: (response: any) => {
        this.getProducts();
        this.toastr.success(response.message, 'Success');
        if (this.adjustmentType == 'qty') {
          this.selectedRow.qtyOnHand = this.newQuantityOnHand;
          this.currentQuantityOnHand = this.selectedRow.qtyOnHand;
        }

        if (this.adjustmentType == 'price') {
          this.selectedRow.sellingPrice = this.newSellingPrice;
          this.currentSellingPrice = this.selectedRow.sellingPrice;
        }

        if (this.adjustmentType == 'lot-no') {
          this.selectedRow.lotNumber = this.newLotNo;
          this.currentLotNo = this.selectedRow.lotNumber;
        }

        if (this.adjustmentType == 'expirydate') {
          this.selectedRow.expiryDate = this.formatExpiryDate(this.newExpiryDate);
          this.currentExpiryDate = this.formatExpiryDate(this.selectedRow.expiryDate);
        }

        this.adjustmentReason = '';
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Error');
      }
    });
  }

  private formatExpiryDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  }

  isExpiryInRange(expiryDate: string, minMonths: number, maxMonths: number): boolean {
    if (!expiryDate) return false;

    // Parse MM/YYYY format
    const [month, year] = expiryDate.split('/').map(Number);
    const expiry = new Date(year, month - 1, 1); // month is 0-indexed in JS
    const today = new Date();

    // Calculate months difference
    const monthsDiff = (expiry.getFullYear() - today.getFullYear()) * 12 +
      (expiry.getMonth() - today.getMonth());

    return monthsDiff >= minMonths && monthsDiff <= maxMonths || monthsDiff < 0;
  }
}
