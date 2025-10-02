import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {PatientConsultation, PatientConsultationService} from "../patient-consultation.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {interval, merge, of as observableOf, Subscription} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatChipsModule} from "@angular/material/chips";
import {NgClass, NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-patient-consultation-list',
  imports: [
    MatCard,
    MatCardContent,
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    RouterLink,
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
    MatProgressSpinner,
    MatIconButton,
    TablerIconComponent,
    MatChipsModule,
    NgClass,
    NgIf
  ],
  templateUrl: './patient-consultation-list.component.html',
  styleUrl: './patient-consultation-list.component.scss'
})
export class PatientConsultationListComponent implements OnDestroy {
  patientName: string;

  displayedColumns: string[] = ['number', 'patientId', 'consultationId', 'visitType', 'patientName', 'address', 'status', 'action'];
  data: PatientConsultation[] = [];
  isLoadingResults = true;
  isError = false;

  refreshInterval: Subscription;
  status: string = '';

  errorMessage: string = 'Problem loading data. Please try again later.';

  @ViewChild('patientNameInput') patientNameInput: ElementRef;

  constructor(private patientConsultationService: PatientConsultationService, private route: ActivatedRoute,
              private toastr: ToastrService) {
    // Initialize the patient name and address
    this.patientName = '';
  }

  applyFilter() {
    this.getPatientConsultation();
  }

  ngAfterViewInit() {
    // Focus on the patient name input field after the view initializes
    if (this.patientNameInput) {
      this.patientNameInput.nativeElement.focus();
    }

    // Initial data load
    this.getPatientConsultation();

    // Set up automatic refresh every 5 seconds
    this.refreshInterval = interval(5000).subscribe(() => {
      this.getPatientConsultation();
    });
  }

  getPatientConsultation() {
    merge().pipe(
      startWith({}),
      switchMap(() => {
        return this.patientConsultationService!.getPatientConsultation(this.patientName, this.status);
      }),
      map((data: any) => {
        this.isLoadingResults = false;
        this.isError = false;

        return data.data;
      }),
      catchError((error: any) => {
        this.toastr.error(error.error?.message || 'Failed to load patient consultation', 'Error');

        this.isLoadingResults = false;
        this.isError = true;
        return observableOf([]);
      })
    ).subscribe((data: PatientConsultation[]) => {this.data = data});
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Waiting':
        return 'status-waiting';

      case 'In Progress':
        return 'status-in-progress';

      case 'Completed':
        return 'status-completed';

      default:
        return 'status-default';
    }
  }

  filterByStatus(status: string) {
    this.status = status;
    this.getPatientConsultation();
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }
}
