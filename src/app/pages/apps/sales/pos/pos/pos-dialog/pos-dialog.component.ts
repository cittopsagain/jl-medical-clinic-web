import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {Patient, PosService} from "../../pos.service";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {filter} from "rxjs/operators";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {ToastrService} from "ngx-toastr";
import {DatePipe} from "@angular/common";
import {PosComponent} from "../pos.component";

@Component({
  selector: 'app-pos-dialog',
  imports: [
    MatCard,
    MatCardContent,
    MatDialogClose,
    MatDialogContent,
    MatIconButton,
    TablerIconComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    FormsModule,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatTable,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    DatePipe
  ],
  templateUrl: './pos-dialog.component.html',
  styleUrl: './pos-dialog.component.scss'
})
export class PosDialogComponent {

  selectedFilter: string = 'patient_name';
  displayedColumns = ['visitId', 'patientId', 'prescriptionId', 'patientName', 'address', 'visitDateTime'];
  data: Patient[] = [];
  @ViewChild('searchNameInput') searchNameInput: ElementRef;
  @ViewChild('filterByInput') filterByInput: MatSelect;

  filter: any[] = [
    {
      name: 'Patient Name',
      value: 'patient_name'
    },
    {
      name: 'Prescription ID',
      value: 'patient_diagnosis_id'
    }
  ];

  constructor(private posService: PosService, private toastR: ToastrService,
              private dialogRef: MatDialogRef<PosComponent>) {
  }

  onRowClick(row: Patient) {
    this.dialogRef.close(row);
  }

  ngAfterViewInit() {
    this.getCompletedPatientVisit();
  }

  applyFilter() {
    this.getCompletedPatientVisit();
  }

  getCompletedPatientVisit() {
    this.posService.getCompletedPatientVisit({
      search: this.searchNameInput.nativeElement.value,
      filterBy: this.filterByInput.value
    }).subscribe({
      next: (result: any) => {
        this.data = result.data;
      },
      error: (error) => {
        this.toastR.error('No completed patient visits found.');
      }
    });
  }
}
