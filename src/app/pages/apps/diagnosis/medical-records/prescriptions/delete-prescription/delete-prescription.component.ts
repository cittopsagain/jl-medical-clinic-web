import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {Prescription} from "../../medical-records.service";

@Component({
  selector: 'app-delete-prescription',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatButton
  ],
  templateUrl: './delete-prescription.component.html',
  styleUrl: './delete-prescription.component.scss'
})
export class DeletePrescriptionComponent {

  constructor(public dialogRef: MatDialogRef<DeletePrescriptionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                medicineName: string
              }) {}

}
