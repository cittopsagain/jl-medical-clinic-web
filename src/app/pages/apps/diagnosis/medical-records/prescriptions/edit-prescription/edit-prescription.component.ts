import {Component, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButton, MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {Prescription} from "../../medical-records.service";
import {PrescriptionComponent} from "../../../patient-diagnosis/prescription/prescription.component";
import {MatCard, MatCardContent} from "@angular/material/card";
import {PrescriptionsComponent} from "../prescriptions.component";
import {PrescriptionsService} from "../prescriptions.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-edit-prescription',
  imports: [
    MatDialogContent,
    MatDialogClose,
    MatIconButton,
    TablerIconComponent,
    PrescriptionComponent,
    MatCardContent,
    MatCard,
    MatButton
  ],
  templateUrl: './edit-prescription.component.html',
  styleUrl: './edit-prescription.component.scss'
})
export class EditPrescriptionComponent {

  @ViewChild(PrescriptionComponent) prescriptionComponent : PrescriptionComponent;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    prescriptions: Prescription[],
    patientId: number,
    visitId: number
  }, private dialogRef: MatDialogRef<EditPrescriptionComponent>, private prescriptionService: PrescriptionsService,
              private toastR: ToastrService) {

  }

  ngAfterViewInit() {

  }

  addPrescription() {
    this.prescriptionService.updatePrescription({
      patientMedicalSummary: {
        patientId: this.data.patientId,
        visitId: this.data.visitId
      },
      prescriptions: this.prescriptionComponent.prescriptionList,
      currentPrescriptionCount: this.data.prescriptions.length
    }).subscribe({
      next: (result) => {
        if (result.statusCode == 200) {
          this.toastR.success(result.message);
          this.dialogRef.close(this.prescriptionComponent.prescriptionList);
        } else {
          this.toastR.error(result.message);
        }
      },
      error: (error) => {
        this.toastR.error('An error occurred while updating the prescription.');
      }
    });
  }
}
