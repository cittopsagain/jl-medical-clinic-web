import {Component, Inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirm-delete-dialog',
    imports: [
        MatButton,
        MatDialogActions
    ],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.scss'
})
export class ConfirmDeleteDialogComponent {

  constructor(private dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                patientId: string
              }) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
