import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  MatDatepickerModule
} from "@angular/material/datepicker";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { TablerIconComponent } from "angular-tabler-icons";
import { MatSelect } from "@angular/material/select";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import { provideNativeDateAdapter } from '@angular/material/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {Medicine, PatientDiagnosis, PatientDiagnosisService, Prescription, Products} from "./patient-diagnosis.service";
import {ToastrService} from "ngx-toastr";
import {MatDivider} from "@angular/material/divider";
import {AsyncPipe, DatePipe, NgIf, TitleCasePipe, UpperCasePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import { MatExpansionModule } from '@angular/material/expansion';
import {MatTab, MatTabGroup, MatTabLabel, MatTabsModule} from '@angular/material/tabs'
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableModule
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {MatSort} from "@angular/material/sort";
import {MatIcon} from "@angular/material/icon";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {PatientPrescriptionList, PatientVisits} from "../../patient-management/patient-records/patient-records.service";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

@Component({
  selector: 'app-patient-diagnosis',
  imports: [
    MatButton,
    MatDatepickerModule,
    MatFormField,
    MatInput,
    MatLabel,
    TablerIconComponent,
    FormsModule,
    MatCard,
    MatCardContent,
    MatDivider,
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTable,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    MatSort,
    MatTab,
    MatIcon,
    MatTabGroup,
    MatTabLabel,
    UpperCasePipe,
    MatIconButton,
    MatTableModule,
    TitleCasePipe,
    NgIf,
    MatCardHeader,
    MatCardTitle
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './patient-diagnosis.component.html',
  styleUrl: './patient-diagnosis.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ]
})

export class PatientDiagnosisComponent implements OnInit {

  data: PatientDiagnosis;
  productData: Products[] = [];

  panelOpenState = true;
  medicineName: string;
  displayedColumns: string[] = ['productName', 'unit', 'qtyOnHand', 'sellingPrice', 'expiryDate'];
  prescriptionColumns: string[] = ['productName', 'unit', 'qty', 'action'];
  prescriptionReceiptColumns: string[] = ['productName', 'unit', 'qty'];
  prescriptionList: Prescription[] = [];
  selectedPrescription: Prescription;

  columnsToDisplay = ['id', 'name', 'project', 'symbol', 'position'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: PeriodicElement | null = null;

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;

  pageSize = 30;

  showEditPrescription: boolean = false;

  dosage: string;
  instructions: string;

  currentSelectedPrescriptionIndex: number;

  //--- Patient Medical History
  patientComplaintsNotes: string = '';
  diagnosis: string = '';
  followUpCheckupRemarks: string = 'Follow up on 7th day if symptoms persists';
  remarksForMedicalCertificate: string = '';

  //--- Patient Medical History
  patientVisits: PatientVisits[] = [];
  patientPrescriptions: PatientPrescriptionList[] = [];

  selectedPatientPrescriptionsByVisit: PatientPrescriptionList[] = [];
  selectedPatientVisit: PatientVisits;

  patientVisitsDisplayedColumns: string[] = ['visitId', 'dateTimeVisit', 'diagnosis', 'action'];
  patientPrescriptionsDisplayedColumns: string[] = ['visitId', 'productName', 'dosage', 'qty', 'unit'];

  @ViewChild('medicalCertificateInput') medicalCertificateInput: ElementRef;
  //--- End Patient Medical History

  // --- Prescription Print ---
  @ViewChild('prescriptionReceiptInput') prescriptionReceiptInput: ElementRef;
  // --- End Prescription Print ---


  showEditPatientVisit: boolean = false;
  @ViewChild('remarksInput') remarksInput: ElementRef;

  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  constructor(private patientDiagnosisService: PatientDiagnosisService,
              private toastr: ToastrService, private formBuilder: FormBuilder) {
  }

  ngAfterViewInit() {
    this.getPatientDiagnosis();
    setTimeout(() => {
      if (this.medicineNameInput) {
        this.medicineNameInput.nativeElement.focus();
      }
    });

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.getProducts();
  }

  ngOnInit() {

  }

  applyFilter() {
    this.paginator.pageIndex = 0; // Reset to first page
    this.getProducts();
  }

  getPatientDiagnosis() {
    this.patientDiagnosisService.getPatientDiagnosis().subscribe({
      next: (data: any) => {
        this.data = data.data;
        // Get the Medical History
        this.getMedicalHistory(this.data.patientId);
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Oops!');
      }
    });
  }

  getProducts() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.patientDiagnosisService.getProducts(
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
        catchError(() => {
          this.isLoadingResults = false;
          this.isError = true;
          return observableOf([]);
        })
      )
      .subscribe((data: Products[]) => (this.productData = data));
  }

  onRowClicked(index: number) {
    let row = this.productData[index];

    // Check if item already exists in the purchased items
    const existingItem = this.prescriptionList
      .find(item => item.productId === row.productId && item.productHistoryId === row.productHistoryId);

    if (existingItem) {
      if (existingItem.quantity >= row.qtyOnHand) {
        return;
      }

      if (existingItem.quantity >= row.qtyOnHand) {
        return;
      }

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
    this.showEditPrescription = true;
    this.selectedPrescription = row;
    this.currentSelectedPrescriptionIndex = index;
  }

  updatePrescription() {
    this.prescriptionList[this.currentSelectedPrescriptionIndex].dosage = this.dosage;
    this.prescriptionList[this.currentSelectedPrescriptionIndex].instructions = this.instructions;
  }

  savePatientDiagnosis() {
    // To Do: Add dialog box if no prescription;

    this.patientDiagnosisService.savePatientDiagnosis({
      patientMedicalSummary: {
        patientId: this.data.patientId,
        visitId: this.data.consultationId,
        patientComplaintsNotes: this.patientComplaintsNotes,
        diagnosis: this.diagnosis,
        followup: this.followUpCheckupRemarks,
        remarks: this.remarksForMedicalCertificate
      },
      prescriptions: this.prescriptionList
    }).subscribe(
      {
        next: (response: any) => {
          console.log(response.data);
          // Get the Medical History
          // this.getMedicalHistory(this.data.patientId);
          this.getPrescription(this.data.patientId, this.data.consultationId, response.data);
          this.toastr.success(response.message, 'Success!');
          this.clear();
        },
        error: (error) => {
          console.log(error);
          this.toastr.error(error.error.message, 'Oops!');
        }
      }
    )
  }

  getMedicalHistory(patientId: number) {
    this.patientDiagnosisService.getMedicalHistory(patientId).subscribe({
      next: (response: any) => {
        this.patientVisits = response.patientVisits;
        this.patientPrescriptions = response.patientPrescriptionsList;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getPrescription(patientId: number, visitId: number, diagnosisId: number) {
    this.patientDiagnosisService.getPrescription(patientId, visitId, diagnosisId).subscribe({
      next: (response: any) => {
        this.selectedPatientVisit = response.patientVisits[0]; // There should be only one
        this.selectedPatientVisit.diagnosisId = diagnosisId;
        this.patientPrescriptions = response.patientPrescriptionsList;

        console.log(this.patientPrescriptions);

        // Automatically print the prescription
        this.printPrescription();
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Oops!');
      }
    });

  }

  onMedicalHistoryRowClick(index: number, row: PatientVisits) {
    // Get prescriptions related to this visit
    this.selectedPatientPrescriptionsByVisit = [];
    this.getPrescriptionsByVisitId(row.visitId);
    this.selectedPatientVisit = row;
  }

  /**
   * Returns prescriptions that match the given visit ID
   */
  getPrescriptionsByVisitId(visitId: number) {
    for (let i = 0; i < this.patientPrescriptions.length; i++) {
      if (this.patientPrescriptions[i].visitId === visitId) {
        this.selectedPatientPrescriptionsByVisit.push(this.patientPrescriptions[i]);
      }
    }
  }

  // Medical History
  printMedicalCertificate() {
    const element = this.medicalCertificateInput.nativeElement;

    // Make visible temporarily
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.left = '-9999px';

    // Wait for rendering
    setTimeout(() => {
      html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        scale: 2
      }).then(canvas => {
        try {
          const fullName = this.data.firstName + '' + this.data.lastName;
          const fileName = 'MedicalCertificate_' + fullName.replaceAll(" ", "") + '_' +
            new Date().toISOString().split('T')[0].replace(/-/g, '') + '.pdf';
          const imgData = canvas.toDataURL('image/png', 1.0);
          const pdf = new jsPDF('portrait', 'mm', 'a4');

          const imgWidth = 210;
          const imgHeight = canvas.height * imgWidth / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          // pdf.save(fileName); // Save to file

          const pdfBlob = pdf.output('blob');
          const objectUrl = URL.createObjectURL(pdfBlob);
          window.open(objectUrl, '_blank', 'width=900,height=900,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1'); // Open in new window

          // Hide element again
          element.style.display = 'none';
        } catch (error) {
          console.error('Error generating PDF:', error);
          element.style.display = 'none';
        }
      }).catch(error => {
        console.error('Error capturing HTML to canvas:', error);
        element.style.display = 'none';
      });
    }, 100);
  }

  updatePatientRemarks() {
    let remarks = this.remarksInput.nativeElement.value;
    this.selectedPatientVisit.remarks = this.remarksInput.nativeElement.value;
  }

  clear() {
    this.prescriptionList = [];
    this.showEditPrescription = false;
    this.dosage = '';
    this.instructions = '';
    this.patientComplaintsNotes = '';
    this.diagnosis = '';
    this.followUpCheckupRemarks = 'Follow up on 7th day if symptoms persists';
    this.remarksForMedicalCertificate = '';
    this.patientVisits = [];
    this.patientPrescriptions = [];
    this.selectedPatientPrescriptionsByVisit = [];
    this.medicalCertificateInput.nativeElement.value = '';
    this.showEditPatientVisit = false;
    this.remarksInput.nativeElement.value = '';
  }

  printPrescription() {
    // The prescription receipt is cut crosswise
    // Paper: A4 size (210mm x 297mm)
    // Receipt width: 105mm
    // Receipt height: 148.5mm
    // Orientation: Portrait

    const element = this.prescriptionReceiptInput.nativeElement;

    // Make visible temporarily
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.left = '-9999px';

    setTimeout(() => {
      html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        scale: 2
      }).then(canvas => {
        try {
          const fullName = this.data?.firstName + ' ' + this.data?.lastName || 'Patient';
          const fileName = 'Prescription_' + fullName.replaceAll(" ", "") + '_' +
            new Date().toISOString().split('T')[0].replace(/-/g, '') + '.pdf';

          // Create PDF with A6 dimensions
          const pdf = new jsPDF('portrait', 'mm', [105, 148.5]);

          // Set page dimensions
          const pageWidth = 105; // mm
          const pageHeight = 148.5; // mm
          const margin = 5; // mm

          // Available content area
          const contentWidth = pageWidth - (margin * 2);
          const contentHeight = pageHeight - (margin * 2);

          // Calculate image dimensions
          const imgWidth = contentWidth;
          const scale = imgWidth / canvas.width;
          const imgHeight = canvas.height * scale;

          // Calculate how many pages we need
          const pageCount = Math.ceil(imgHeight / contentHeight);

          // For each page
          for (let i = 0; i < pageCount; i++) {
            if (i > 0) {
              pdf.addPage();
            }

            // Create a temporary canvas for this section
            const tempCanvas = document.createElement('canvas');
            const tempContext = tempCanvas.getContext('2d');

            // Calculate source and destination dimensions
            const sourceY = i * (contentHeight / scale);
            const sourceHeight = Math.min(canvas.height - sourceY, contentHeight / scale);

            // Set temporary canvas size
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;

            // Draw the portion of the original canvas to the temp canvas
            if (tempContext) {
              tempContext.drawImage(
                canvas,
                0, sourceY + 5, canvas.width, sourceHeight,
                0, 0, canvas.width, sourceHeight
              );
            }

            // Convert the temp canvas to an image and add to PDF
            const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
            const destHeight = sourceHeight * scale;

            pdf.addImage(
              pageImgData,
              'PNG',
              margin,
              margin,
              imgWidth,
              destHeight
            );
          }

          const pdfBlob = pdf.output('blob');
          const objectUrl = URL.createObjectURL(pdfBlob);
          window.open(objectUrl, '_blank', 'width=900,height=900,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1');

          // Hide element again
          element.style.display = 'none';
        } catch (error) {
          console.error('Error generating PDF:', error);
          element.style.display = 'none';
        }
      }).catch(error => {
        console.error('Error capturing HTML to canvas:', error);
        element.style.display = 'none';
      });
    }, 100);
  }
}

export interface PeriodicElement {
  name: string;
  position: string;
  id: number;
  project: string;
  symbol: string;
  description: string;
}
