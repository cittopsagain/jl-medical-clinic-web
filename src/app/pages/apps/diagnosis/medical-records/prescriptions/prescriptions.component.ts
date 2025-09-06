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
import {UpperCasePipe} from "@angular/common";
import {MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";

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
    TablerIconComponent
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.scss'
})
export class PrescriptionsComponent {

  prescriptions: Prescription[] = [];
  prescriptionsDisplayedColumns: string[] = ['visitId', 'productName', 'dosage', 'qty', 'unit'];

  constructor(private prescriptionsService: PrescriptionsService) {
  }

  ngAfterViewInit() {
    this.prescriptionsService.prescriptions$.subscribe(prescriptions => {
      if (prescriptions) {
        this.prescriptions = prescriptions;
      }
    });
  }

}
