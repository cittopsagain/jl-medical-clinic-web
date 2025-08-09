import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { MatButton } from "@angular/material/button";
import {
  MatDatepickerModule
} from "@angular/material/datepicker";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { TablerIconComponent } from "angular-tabler-icons";
import { MatSelect } from "@angular/material/select";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import { provideNativeDateAdapter } from '@angular/material/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {Medicine, PatientDiagnosis, PatientDiagnosisService} from "./patient-diagnosis.service";
import {ToastrService} from "ngx-toastr";
import {MatDivider} from "@angular/material/divider";
import {AsyncPipe, DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-patient-diagnosis',
  imports: [
    MatButton,
    MatDatepickerModule,
    MatFormField,
    MatInput,
    MatLabel,
    TablerIconComponent,
    FormsModule,
    MatCard,
    MatCardContent,
    MatDivider,
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTable,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './patient-diagnosis.component.html',
  styleUrl: './patient-diagnosis.component.scss'
})

export class PatientDiagnosisComponent implements OnInit {

  data: PatientDiagnosis;
  panelOpenState = true;
  medicineName: string;
  displayedColumns: string[] = ['medicineName', 'dosage'];
  medicineList: Medicine[] = [];

  @ViewChild('medicineNameInput') medicineNameInput: ElementRef;

  constructor(private patientDiagnosisService: PatientDiagnosisService,
              private toastr: ToastrService, private formBuilder: FormBuilder) {
  }

  ngAfterViewInit() {
    this.getPatientDiagnosis();
    setTimeout(() => {
      if (this.medicineNameInput) {
        this.medicineNameInput.nativeElement.focus();
      }
    });
  }

  ngOnInit() {

  }

  applyFilter() {
    this.getMedicineList()
  }

  getPatientDiagnosis() {
    this.patientDiagnosisService.getPatientDiagnosis().subscribe({
      next: (data: any) => {
        this.data = data.data;
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Oops!');
      }
    });
  }

  getMedicineList() {
    if (this.medicineName == '' || this.medicineName == null) {
      this.medicineList = [];
      return;
    }
    this.patientDiagnosisService.getMedicines(this.medicineName).subscribe({
      next: (data: any) => {
        if (data == null || data.data == null) {
          this.toastr.warning('No medicine(s) found', 'Oops!');
          this.medicineList = [];
          return;
        }
        this.medicineList = data.data.medicines;
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Oops!');
      }
    })
  }
}
