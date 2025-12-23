import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrescriptionsService} from "./prescriptions.service";
import {MedicalRecordsService, Prescription} from "../medical-records.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {NgIf, UpperCasePipe} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {
  MatDialog,
} from "@angular/material/dialog";
import {EditPrescriptionComponent} from "./edit-prescription/edit-prescription.component";
import {ToastrService} from "ngx-toastr";
import {DeletePrescriptionComponent} from "./delete-prescription/delete-prescription.component";
import {VisitsComponent} from "../visits/visits.component";
import {FormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {MatIcon} from "@angular/material/icon";
import {Router} from "@angular/router";

@Component({
  selector: 'app-prescriptions',
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    UpperCasePipe,
    MatHeaderCellDef,
    MatIconButton,
    TablerIconComponent,
    NgIf,
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.scss'
})
export class PrescriptionsComponent implements OnDestroy {

  prescriptions: Prescription[] = [];
  prescriptionsDisplayedColumns: string[] = ['productName', 'dosage', 'qty', 'unit', 'action'];
  showEditPrescriptionDiv: boolean = false;
  displayedColumns: string[] = ['productName', 'unit', 'qtyOnHand', 'sellingPrice', 'expiryDate'];
  @ViewChild(VisitsComponent) visitsComponent: VisitsComponent;
  @ViewChild('quantityInput') quantityInput: ElementRef;
  @ViewChild('dosageInput') dosageInput: ElementRef;
  @ViewChild('instructionInput') instructionInput: ElementRef;

  patientId: number;
  visitId: number;
  diagnosisId: number = 0;

  selectedPrescription: any;

  private destroy$ = new Subject<void>();

  constructor(private prescriptionsService: PrescriptionsService,
              private matDialog: MatDialog,
              private toastR: ToastrService,
              private prescriptionService: PrescriptionsService,
              private medicalRecordsService: MedicalRecordsService,
              private router: Router
  ) {
    this.prescriptionService.prescriptionPatientIdAndVisitIdObservable$.pipe(takeUntil(this.destroy$))
      .subscribe(({patientId, visitId}) => {
        this.prescriptions = []; // Clear existing prescriptions
        if (patientId && visitId) {
          this.patientId = patientId;
          this.visitId = visitId;

          this.prescriptions = []; // Clear existing prescriptions
          this.getPrescriptions();
        } else {
          this.prescriptions = [];
          this.visitId = 0;
        }

        this.showEditPrescriptionDiv = false;
      });
  }

  ngAfterViewInit() {

  }

  showEditDiv() {
    if (!this.visitId) {
      this.toastR.error('Please select a visit');
      return;
    }

    const dialogRef = this.matDialog.open(EditPrescriptionComponent, {
      data: {
        prescriptions: this.prescriptions,
        patientId: this.patientId,
        visitId: this.visitId
      },
      width: '1600px',
      maxWidth: '95vw', // Add max width as viewport width
      height: 'auto',
      panelClass: 'full-width-dialog', // Custom class for additional styling
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
         this.prescriptions = [
           {
             patientId: this.patientId,
             visitId: this.visitId,
             diagnosisId: 0,
             ...result
           }
         ];

        this.getPrescriptions();
      }
    });
  }

  printPatientPrescription() {
    if (!this.visitId) {
      this.toastR.error('Please select a visit');
      return;
    }

    let patientId = this.patientId;
    let visitId = this.visitId;

    this.medicalRecordsService.getPrescription(patientId, visitId).subscribe({
      next: (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (error) => {
        this.toastR.error(error.error.message, 'Error');
      }
    });
  }

  getPrescriptions() {
    this.prescriptionsService.getPrescriptions(
      this.patientId,
      this.visitId,
      this.diagnosisId
    ).subscribe({
      next: (res) => {
        this.prescriptions = res;
      },
      error: err => {
        this.toastR.error('Failed to retrieve prescriptions');
      }
    });
  }

  deletePrescription(row: any, enterAnimationDuration: string = '0ms', exitAnimationDuration: string = '0ms') {
    this.matDialog.open(DeletePrescriptionComponent, {
      width: '400px',
      data: {
        medicineName: row.brandName + ' ' + row.productName,
      },
      enterAnimationDuration,
      exitAnimationDuration,
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.prescriptionsService.deletePrescription(row.prescriptionId, row.nonStock).subscribe({
          next: (res) => {
            if (res.statusCode == 200) {
              this.getPrescriptions();
              this.toastR.success(res.message);
            } else {
              this.toastR.error(res.message);
            }
          },
          error: err => {
            this.toastR.error('Failed to delete prescription');
          }
        });
      }
    });
  }

  updatePrescription() {
    let params = {
      patientId: this.selectedPrescription.patientId,
      prescriptionId: this.selectedPrescription.prescriptionId,
      dosage: this.dosageInput.nativeElement.value,
      quantity: parseInt(this.quantityInput.nativeElement.value),
      instructions: this.instructionInput.nativeElement.value,
      nonStock: this.selectedPrescription.nonStock
    };

    if (params.quantity <= 0 || isNaN(params.quantity) || params.dosage.trim() === '') {
      this.toastR.error('Please enter a valid dosage or quantity');
      return;
    }

    this.prescriptionsService.updatePrescription(params).subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          this.toastR.success(res.message, 'Success');
          this.getPrescriptions();
          this.showEditPrescriptionDiv = false;
        } else {
          this.toastR.error(res.message, 'Error');
        }
      },
      error: err => {
        this.toastR.error('Failed to update prescription', 'Error');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
