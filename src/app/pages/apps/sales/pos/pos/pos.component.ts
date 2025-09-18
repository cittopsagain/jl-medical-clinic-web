import {Component, ElementRef, numberAttribute, ViewChild} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PosService, Products, PurchasedProducts} from "../pos.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatDivider} from "@angular/material/divider";
import {DatePipe, DecimalPipe, NgIf, UpperCasePipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {ToastrService} from "ngx-toastr";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";

@Component({
  selector: 'app-pos',
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    MatSort,
    MatTable,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatHeaderCellDef,
    MatPaginator,
    MatDivider,
    MatButton,
    DecimalPipe,
    MatCheckbox,
    NgIf,
    UpperCasePipe,
    MatRadioButton,
    MatRadioGroup,
    MatCardTitle
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent {

  medicineName: string;
  data: Products[] = [];
  purchasedItems: PurchasedProducts[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;

  pageSize = 30;

  totalItemsPurchased: number = 0;
  discountPercent: number = 0;
  totalItemsPurchasedDue: number = 0;

  proceedToPayment: boolean = false;
  isSeniorCitizenPwdDiscounted: boolean = false;

  change: number = 0;
  cash: number = 0;

  selectedCustomerType: string;

  todaysSales: number = 0.00;

  customerType: string[] = ['Prescription', 'Walk-in'];

  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  @ViewChild('cashInput') cashInput: ElementRef;

  displayedColumns: string[] = ['productName', 'unit', 'qtyOnHand', 'sellingPrice', 'expiryDate'];
  purchasedItemsColumns: string[] = ['productName', 'unit', 'qty', 'price'];

  constructor(private posService: PosService, private toastR: ToastrService) {
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.getProducts();
    if (this.medicineNameInput) {
      this.medicineNameInput.nativeElement.focus();
    }

    this.getTodaysSales();
  }

  applyFilter() {
    this.paginator.pageIndex = 0; // Reset to first page
    this.getProducts();
  }

  getTodaysSales() {
    this.posService.getTodaysSales().subscribe({
      next: (response: any) => {
        this.todaysSales = response.data;
      },
      error: (error) => {
        this.toastR.error(error.error?.message || 'Failed to load today\'s sales', 'Error');
      }
    });
  }

  getProducts() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.posService.getProducts(
            {
              productName: this.medicineName
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
          this.toastR.error(error.error?.message || 'Failed to load products', 'Error');

          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Products[]) => (this.data = data));
  }

  addItemsToCustomerOrders(index: number) {
    if (this.proceedToPayment) {
      return;
    }

    let row = this.data[index];

    // Check if item already exists in the purchased items
    const existingItem = this.purchasedItems
      .find(item => item.productId === row.productId && item.productHistoryId === row.productHistoryId);

    if (existingItem) {
      if (existingItem.qty >= row.qtyOnHand) {
        return;
      }

      // If item exists, increment quantity
      existingItem.qty = (existingItem.qty || 1) + 1;
      existingItem.totalAmount = existingItem.qty * row.sellingPrice;
    } else {
      // If item doesn't exist, add it with qty = 1
      const newItem = {...row, qty: 1, totalAmount: 1 * row.sellingPrice};
      this.purchasedItems.push(newItem);
    }

    // Create a new array reference to trigger change detection
    this.purchasedItems = [...this.purchasedItems];

    this.calculateTotalItemsPurchased();
  }

  removeItemFromCustomerOrders(row: Products) {
    // Find the index of the item to be removed
    const index = this.purchasedItems.findIndex(item => item.productId === row.productId);

    if (index !== -1) {
      const item = this.purchasedItems[index];

      // If item exists and quantity > 1, decrement quantity
      if (item.qty && item.qty > 1) {
        item.qty -= 1;
        item.totalAmount = item.qty * item.sellingPrice;
      } else {
        // If quantity is 1 or 0, remove the item
        this.purchasedItems.splice(index, 1);
      }

      // Create a new array reference to trigger change detection
      this.purchasedItems = [...this.purchasedItems];

      this.calculateTotalItemsPurchased();
    }
  }

  toggleScPwdDiscount(event: MatCheckboxChange) {
    // Apply 20% discount if checked, otherwise set to 0
    this.discountPercent = event.checked ? 20 : 0;

    this.calculateTotalItemsPurchased();
    this.isSeniorCitizenPwdDiscounted = event.checked ? true : false;
  }

  calculateTotalItemsPurchased() {
    let totalAmount = 0;
    if (this.purchasedItems.length > 0) {
      for (let i = 0; i < this.purchasedItems.length; i++) {
        totalAmount += this.purchasedItems[i].totalAmount;
      }
    }

    this.totalItemsPurchased = totalAmount;

    // Calculate the total due after discount
    const discountAmount = this.totalItemsPurchased * (this.discountPercent / 100);
    this.totalItemsPurchasedDue = this.totalItemsPurchased - discountAmount;
  }

  processPayment(proceedToPayment: boolean) {
    this.proceedToPayment = proceedToPayment; // Getting ready for cash drawer to be integrated
    if (!this.proceedToPayment) {
      this.change = 0.00;
      this.cash = 0;
    }
  }

  calculateChange() {
    if (this.cash <= 0 || this.cash == null) {
      this.change = 0.00;
      return;
    }

    if (this.cash < this.totalItemsPurchasedDue) {
      this.change = 0.00;
      return;
    }

    if (this.cash >= this.totalItemsPurchasedDue) {
      this.change = this.cash - this.totalItemsPurchasedDue;
    }
  }

  confirmPayment() {
    this.cash = this.cash * 1; // Remove leading zeros, if the user will input 0000, it will be converted to 0

    if (this.cash <= 0 || this.cash == null || this.cash < this.totalItemsPurchasedDue) {
      return;
    }

    this.posService.savePurchasedProducts({
      header: {
        totalAmount: this.totalItemsPurchased,
        isSeniorCitizenPwdDiscounted: this.isSeniorCitizenPwdDiscounted ? 1 : 0,
        discountPercent: this.discountPercent,
        totalAmountDue: this.totalItemsPurchasedDue,
        totalAmountPaid: this.cash,
        customerOrderType: this.selectedCustomerType
      },
      details: this.purchasedItems
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode === 400) {
          this.toastR.error(response.message);
          this.getProducts();
          return;
        }

        this.toastR.success(response.message, 'Success');
        this.getProducts();
        this.purchasedItems = [];
        this.proceedToPayment = false;
        this.change = 0.00;
        this.cash = 0;
        this.selectedCustomerType = '';

        // Reset the medicine name input
        if (this.medicineNameInput) {
          this.medicineNameInput.nativeElement.value = '';
          this.medicineName = '';
        }

        // Focus back to the medicine name input
        if (this.medicineNameInput) {
          this.medicineNameInput.nativeElement.focus();
        }

        this.totalItemsPurchased = 0;
        this.totalItemsPurchasedDue = 0;
        this.isSeniorCitizenPwdDiscounted = false;
        this.discountPercent = 0;

        this.getTodaysSales();

        let posId = response.data;
        this.getPharmacySales(posId);
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }

  getPharmacySales(posId: number) {
    this.posService.getReceipt(posId).subscribe({
      next: (res: any) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        // Trigger download
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `Receipt_${posId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (err: any) => {
        this.toastR.error(err.error.message, 'Error');
      }
    });
  }
}
