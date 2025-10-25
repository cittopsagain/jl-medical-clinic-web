import {Component, ElementRef, ViewChild} from '@angular/core';
import {PrescriptionsService} from "./prescriptions.service";
import {Prescription} from "../medical-records.service";
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
import {MatButton, MatButtonModule, MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {Products} from "../../patient-diagnosis/patient-diagnosis.service";
import {MatIcon} from "@angular/material/icon";
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {AppEmployeeDialogContentComponent} from "../../../employee/employee.component";
import {EditPrescriptionComponent} from "./edit-prescription/edit-prescription.component";
import {ToastrService} from "ngx-toastr";
import {AppDialogOverviewComponent} from "../../../../ui-components/dialog/dialog.component";
import {DeletePrescriptionComponent} from "./delete-prescription/delete-prescription.component";
import {VisitsComponent} from "../visits/visits.component";
import {FormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";

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
    MatIcon,
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.scss'
})
export class PrescriptionsComponent {

  prescriptions: Prescription[] = [];
  prescriptionsDisplayedColumns: string[] = ['visitId', 'productName', 'dosage', 'qty', 'unit', 'action'];
  showEditPrescriptionDiv: boolean = false;
  displayedColumns: string[] = ['productName', 'unit', 'qtyOnHand', 'sellingPrice', 'expiryDate'];
  @ViewChild(VisitsComponent) visitsComponent: VisitsComponent;
  @ViewChild('quantityInput') quantityInput: ElementRef;
  @ViewChild('dosageInput') dosageInput: ElementRef;
  @ViewChild('instructionInput') instructionInput: ElementRef;

  selectedPrescription: any;

  showAddRow = false;
  newPrescription = { visitId: '', brandName: '', productName: '', dosage: '', quantity: 0, unit: '' };

  productData: Products[] = [];

  constructor(private prescriptionsService: PrescriptionsService, private matDialog: MatDialog, private toastR: ToastrService) {

  }

  ngAfterViewInit() {
    this.prescriptionsService.prescriptions$.subscribe(prescriptions => {
      if (prescriptions) {
        this.prescriptions = prescriptions;

        // We need to get again the prescription
        if (this.prescriptions.length > 0) {
          this.getPrescriptions();
        }
      }
    });
  }

  showEditDiv(patientId: number, visitId: number) {
    if (visitId == null) {
      this.toastR.error('Please select a visit');
      return;
    }

    const dialogRef = this.matDialog.open(EditPrescriptionComponent, {
      data: {
        prescriptions: this.prescriptions,
        patientId: patientId,
        visitId: visitId
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
             patientId: patientId,
             visitId: visitId,
             diagnosisId: 0,
             ...result
           }
         ];

        this.getPrescriptions();

        /* if (Array.isArray(result)) {
          this.getPrescriptions();
          this.prescriptions = [...this.prescriptions, ...result];
        } else {
          this.prescriptions.push(result);
        } */
      }
    });
  }

  getPrescriptions() {
    this.prescriptionsService.getPrescriptions(
      this.prescriptions[0].patientId,
      this.prescriptions[0].visitId,
      this.prescriptions[0].diagnosisId
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
              // Remove the deleted prescription from the local array
              // this.prescriptions = this.prescriptions.filter(p => p.prescriptionId !== row.prescriptionId);

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
}
