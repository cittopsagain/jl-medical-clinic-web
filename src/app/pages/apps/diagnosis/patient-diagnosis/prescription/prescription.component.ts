import {Component, ElementRef, ViewChild} from '@angular/core';
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {PatientDiagnosisService, Prescription, Products} from "../patient-diagnosis.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatButton} from "@angular/material/button";
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
import {NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {TablerIconComponent} from "angular-tabler-icons";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-prescription',
  imports: [
    MatButton,
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
    NgIf,
    ReactiveFormsModule,
    TablerIconComponent,
    UpperCasePipe,
    MatHeaderCellDef,
    FormsModule
  ],
  templateUrl: './prescription.component.html',
  styleUrl: './prescription.component.scss'
})
export class PrescriptionComponent {

  selectedPrescription: any;

  productData: Products[] = [];
  prescriptionList: any[] = [];

  prescriptionColumns: string[] = ['productName', 'unit', 'qty', 'action'];
  displayedColumns: string[] = ['productName', 'unit', 'qtyOnHand', 'sellingPrice', 'expiryDate'];

  showEditPrescription: boolean = false;
  showAddNonStock: boolean = false;
  isLoadingResults = true;
  isError = false;
  resultsLength = 0;
  pageSize: number = 30;
  currentSelectedPrescriptionIndex: number;
  currentSelectedProduct: Products;

  dosage: string = '';
  instructions: string = '';
  qty: number = 0;

  prescriptionForm: UntypedFormGroup | any;

  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  constructor(private fb: UntypedFormBuilder, private patientDiagnosisService: PatientDiagnosisService,
              private toastR: ToastrService) {
    this.prescriptionForm = this.fb.group({
      brandName: ['', Validators.required],
      productName: ['', Validators.required],
      unit: ['', Validators.required],
      qty: ['', Validators.required],
      dosage: ['', Validators.required],
      instructions: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.getProducts();
  }

  getProducts() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.patientDiagnosisService.getProducts(
            {
              productName: this.medicineNameInput?.nativeElement.value || '',
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
        catchError((error) => {
          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Products[]) => (this.productData = data));
  }

  applyFilter() {
    this.paginator.pageIndex = 0;
    this.getProducts();
  }

  onRowClicked(index: number) {
    let row = this.productData[index];

    // Check if item already exists in the purchased items
    const existingItem = this.prescriptionList
      .find(item => item.productId === row.productId && item.productHistoryId === row.productHistoryId);

    if (this.showAddNonStock || this.showEditPrescription) {
      return;
    }

    if (existingItem) {
      /* if (existingItem.quantity >= row.qtyOnHand) {
        return;
      } */

      // If item exists, increment quantity
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      // If item doesn't exist, add it with qty = 1
      let dosage = '';

      const newItem = {...row, quantity: 1, instructions: '', dosage: row.dosage};
      this.prescriptionList.push(newItem);
    }

    // Create a new array reference to trigger change detection
    this.prescriptionList = [...this.prescriptionList];
  }

  onPrescriptionQtyClicked(row: Prescription, index: number) {
    if (index !== -1) {
      const item = row;

      // If item exists and quantity > 1, decrement quantity
      if (item.quantity && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        // If quantity is 1 or 0, remove the item
        this.prescriptionList.splice(index, 1);
      }

      // Create a new array reference to trigger change detection
      this.prescriptionList = [...this.prescriptionList];
    }
  }

  editPrescription(row: Prescription, index: number) {
    this.dosage = row.dosage;
    this.instructions = row.instructions;
    this.qty = this.prescriptionList[index].quantity;
    this.showEditPrescription = true;
    this.selectedPrescription = row;
    this.currentSelectedPrescriptionIndex = index;
  }

  updatePrescription() {
    /* if (this.qty > this.currentSelectedProduct.qtyOnHand) {
      this.toastR.error('Quantity exceeds available stock.', 'Error');
      return;
    } */

    this.prescriptionList[this.currentSelectedPrescriptionIndex].dosage = this.dosage;
    this.prescriptionList[this.currentSelectedPrescriptionIndex].instructions = this.instructions;
    this.prescriptionList[this.currentSelectedPrescriptionIndex].quantity = this.qty;

    if (this.qty <= 0) {
      this.onPrescriptionQtyClicked(
        this.prescriptionList[this.currentSelectedPrescriptionIndex],
        this.currentSelectedPrescriptionIndex
      );

      this.prescriptionList = [...this.prescriptionList];
    }

    this.showEditPrescription = false;
  }

  addNonStock() {
    this.prescriptionList = [
      ...this.prescriptionList,
      {
        "productHistoryId": 0,
        "productId": 0,
        "brandId": 0,
        "brandName": this.prescriptionForm.value.brandName,
        "productName": this.prescriptionForm.value.productName,
        "qtyOnHand": 0,
        "sellingPrice": 0,
        "expiryDate": "00/0000",
        "unit": this.prescriptionForm.value.unit,
        "dosage": this.prescriptionForm.value.dosage,
        "quantity": this.prescriptionForm.value.qty,
        "instructions": this.prescriptionForm.value.instructions
      }
    ];

    this.showAddNonStock = false;
    this.prescriptionForm.reset();
  }
}
