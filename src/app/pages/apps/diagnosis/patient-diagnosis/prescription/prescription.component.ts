import {Component, ElementRef, inject, Input, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
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
  MatRow, MatRowDef, MatTable, MatTableDataSource
} from "@angular/material/table";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {isPlatformBrowser, NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {TablerIconComponent} from "angular-tabler-icons";
import {ToastrService} from "ngx-toastr";
import {MatSelect} from "@angular/material/select";
import {MatOption} from "@angular/material/core";
import {MatCheckbox} from "@angular/material/checkbox";

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
    FormsModule,
    MatOption,
    MatSelect,
    MatCheckbox
  ],
  templateUrl: './prescription.component.html',
  styleUrl: './prescription.component.scss'
})
export class PrescriptionComponent implements OnInit {

  selectedPrescription: any;
  private _prescriptionList: any[] = [];
  prescriptionDataSource = new MatTableDataSource<any>([]);

  productData: Products[] = [];

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

  includeExpired: boolean;
  includeZeroQty: boolean;

  filter: any[] = [
    {
      name: 'Brand Name',
      value: 'brand_name'
    },
    {
      name: 'Generic Name',
      value: 'product_name'
    }
  ];
  selectedFilter: string = 'brand_name';
  private isInitialized = false;

  prescriptionForm: UntypedFormGroup | any;
  @Input('addAdditionalPrescription') addAdditionalPrescription: boolean = false;
  @ViewChild('qtyInputRef')  qtyInputRef: ElementRef;
  @ViewChild('dosageInputRef')  dosageInputRef: ElementRef;
  @ViewChild('instructionsInputRef')  instructionsInputRef: ElementRef;

  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  @ViewChild('filterByInput') filterByInput: MatSelect;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);
  private platformId = inject(PLATFORM_ID);

  get prescriptionList(): any[] {
    return this._prescriptionList;
  }

  set prescriptionList(value: any[]) {
    this._prescriptionList = value;
    this.prescriptionDataSource.data = value; // Update the dataSource

    this.setPrescriptionToSessionStorage();
  }

  constructor(private fb: UntypedFormBuilder,
              private patientDiagnosisService: PatientDiagnosisService,
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

  ngOnInit() {

  }

  ngAfterViewInit() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    if (isPlatformBrowser(this.platformId)) {
      const savedData = sessionStorage.getItem('DIAGNOSIS_PRESCRIPTION_SESSION_STORAGE');
      const savedDataMedicalRecordsDiagnosisPrescription = sessionStorage.getItem(
        'MEDICAL_RECORDS_DIAGNOSIS_PRESCRIPTION_SESSION_STORAGE'
      );

      if (savedData) {
        this.prescriptionList = [...JSON.parse(savedData)];

        if (this.addAdditionalPrescription) {
          this.prescriptionList = []; // Reset if from medical records/diagnosis history and adding new prescription
        }

        const savedDataPatientInformationSessionStorage = sessionStorage.getItem(
          'DIAGNOSIS_PATIENT_INFORMATION_SESSION_STORAGE'
        );
        if (savedDataPatientInformationSessionStorage) {
          const parsedData = JSON.parse(savedDataPatientInformationSessionStorage);
        } else {
          this.prescriptionList = []; // Reset if no patient information found
        }
      }
    }

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
              filterBy: this.filterByInput?.value || 'Brand Name',
              showZeroQty: this.includeZeroQty? 1 : 0,
              showExpired: this.includeExpired? 1 : 0
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

  private setPrescriptionToSessionStorage() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem("DIAGNOSIS_PRESCRIPTION_SESSION_STORAGE", JSON.stringify(this._prescriptionList));
    }
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
    this.prescriptionList[this.currentSelectedPrescriptionIndex].dosage = this.dosage;
    this.prescriptionList[this.currentSelectedPrescriptionIndex].instructions = this.instructions;
    this.prescriptionList[this.currentSelectedPrescriptionIndex].quantity = this.qty;

    if (this.qty <= 0) {
      this.onPrescriptionQtyClicked(
        this.prescriptionList[this.currentSelectedPrescriptionIndex],
        this.currentSelectedPrescriptionIndex
      );
    }

    this.prescriptionList = [...this.prescriptionList];

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
