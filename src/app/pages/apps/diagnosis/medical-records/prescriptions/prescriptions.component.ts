import { Component } from '@angular/core';
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
import {MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {Products} from "../../patient-diagnosis/patient-diagnosis.service";
import {MatIcon} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {AppEmployeeDialogContentComponent} from "../../../employee/employee.component";
import {EditPrescriptionComponent} from "./edit-prescription/edit-prescription.component";
import {ToastrService} from "ngx-toastr";

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
    MatIcon
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.scss'
})
export class PrescriptionsComponent {

  prescriptions: Prescription[] = [];
  prescriptionsDisplayedColumns: string[] = ['visitId', 'productName', 'dosage', 'qty', 'unit'];
  showEditPrescriptionDiv: boolean = false;
  displayedColumns: string[] = ['productName', 'unit', 'qtyOnHand', 'sellingPrice', 'expiryDate'];

  showAddRow = false;
  newPrescription = { visitId: '', brandName: '', productName: '', dosage: '', quantity: 0, unit: '' };

  productData: Products[] = [];

  constructor(private prescriptionsService: PrescriptionsService, private matDialog: MatDialog, private toastR: ToastrService) {

  }

  ngAfterViewInit() {
    this.prescriptionsService.prescriptions$.subscribe(prescriptions => {
      if (prescriptions) {
        this.prescriptions = prescriptions;
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
        if (Array.isArray(result)) {
          this.prescriptions = [...this.prescriptions, ...result];
        } else {
          this.prescriptions.push(result);
        }
      }
    });
  }
}
