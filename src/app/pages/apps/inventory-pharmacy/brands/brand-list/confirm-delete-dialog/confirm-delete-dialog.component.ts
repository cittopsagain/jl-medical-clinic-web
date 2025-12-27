import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.scss'
})
export class ConfirmDeleteDialogComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                brandName: string
              }) {}
}
