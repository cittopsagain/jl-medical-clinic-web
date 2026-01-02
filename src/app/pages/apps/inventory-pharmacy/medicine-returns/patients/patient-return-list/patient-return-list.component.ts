import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatCard, MatCardContent} from "@angular/material/card";
import {AddMedicineReturnComponent} from "../add-medicine-return/add-medicine-return.component";
import {MedicineReturnsService} from "../../medicine-returns.service";
import {DatePipe} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {PatientsService} from "../patients.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-patient-return-list',
  imports: [
    MatTab,
    MatTabGroup,
    MatCard,
    MatCardContent,
    AddMedicineReturnComponent,
    DatePipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    MatHeaderCellDef
  ],
  templateUrl: './patient-return-list.component.html',
  styleUrl: './patient-return-list.component.scss'
})
export class PatientReturnListComponent implements AfterViewInit, OnInit {

  displayedColumns = ['returnId', 'posId', 'patientId', 'patientName', 'customerOrderType', 'returnDate'];
  data: any[] = [];
  private destroy$ = new Subject<void>();
  selectedTabIndex: number = 0;

  constructor(private medicineReturnsService: MedicineReturnsService, private patientService: PatientsService) {

  }

  ngOnInit(): void {
    this.patientService.patientMedicineReturnTabBehaviorObservable$.pipe(takeUntil(this.destroy$)).subscribe(tabIndex => {
      this.selectedTabIndex = tabIndex;
      this.getMedicineReturns();
    });
  }

  ngAfterViewInit(): void {
    this.getMedicineReturns();
  }

  getMedicineReturns() {
    this.medicineReturnsService.getMedicineReturns().subscribe({
      next: (res) => {
        this.data = res.data;
      },
      error: (err) => {
        console.error('Error fetching medicine returns', err);
      }
    });
  }
}
