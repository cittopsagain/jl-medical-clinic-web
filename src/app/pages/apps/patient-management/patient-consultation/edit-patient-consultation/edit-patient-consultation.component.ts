import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {PatientConsultation, PatientConsultationService} from "../patient-consultation.service";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {DatePipe, NgIf} from "@angular/common";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {ToastrService} from "ngx-toastr";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-edit-patient-consultation',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    RouterLink,
    ReactiveFormsModule,
    TablerIconComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField,
    DatePipe,
    MatOption,
    MatSelect,
    NgIf,
    MatCheckbox
  ],
  templateUrl: './edit-patient-consultation.component.html',
  styleUrl: './edit-patient-consultation.component.scss'
})
export class EditPatientConsultationComponent implements OnInit {

  patientConsultationForm: UntypedFormGroup | any;
  patientConsultation: PatientConsultation;
  @ViewChild('weightInput') weightInput: ElementRef;

  gender: string[] = [
    'Male',
    'Female'
  ];

  constructor(private route: ActivatedRoute, private patientConsultationService: PatientConsultationService,
              private fb: UntypedFormBuilder, private toastr: ToastrService) {

    this.patientConsultationForm = this.fb.group({
      weight: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]], // Accepts decimal numbers
      height: ['', [Validators.required, Validators.pattern('^\\d*\\d*$')]],
      temperature: ['', [Validators.required, Validators.pattern('^([0-9]|[1-3][0-9]|4[0-2])(\\.\\d{1,2})?$'), Validators.min(0), Validators.max(42)]],
      bloodPressure: ['', [Validators.required, Validators.pattern('^\\d+\\/\\d+$')]],
      heartRate: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]],
      oxygenSaturation: ['', [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]],
      status: ['']
    });
  }

  ngOnInit() {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.getPatientConsultationById(id);
    }
  }

  ngAfterViewInit() {
    // Delay focus to avoid ExpressionChangedAfterItHasBeenChecked error
    setTimeout(() => {
      if (this.weightInput) {
        this.weightInput.nativeElement.focus();
      }
    });
  }

  getPatientConsultationById(id: number) {
    this.patientConsultationService.getPatientConsultationById(id).subscribe({
      next: (data: any) => {
        this.patientConsultation = data.data;

        let sex = 'Female';
        if (data.data.sex === 'M') {
          sex = 'Male';
        }
        this.patientConsultation.sex = sex;

        this.patientConsultationForm.patchValue({
          patientId: data.data.patientId,
          consultationId: data.consultationId,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.data.lastName,
          sex: sex,
          birthDate: data.data.birthDate,
          address: data.data.address,
          consultationDate: data.data.consultationDate,
          weight: data.data.weight,
          height: data.data.height,
          temperature: data.data.temperature,
          bloodPressure: data.data.bloodPressure,
          heartRate: data.data.heartRate,
          oxygenSaturation: data.data.oxygenSaturation
        });
      },
      error: (error) => {
        console.error('Error fetching patient consultation:', error);
      }
    });
  }

  updatePatientConsultation(event: Event) {
    this.patientConsultationForm.value.consultationId = this.patientConsultation.consultationId;
    this.patientConsultationService.updatePatientConsultation(this.patientConsultationForm.value).subscribe({
      next: (data: any) => {
        this.toastr.success(data.message, 'Success');
        this.patientConsultationForm.reset();
        this.getPatientConsultationById(this.patientConsultation.consultationId);
      },
      error: (error) => {
        this.toastr.error(error.error.message, 'Error');
      }
    });
  }

  checkInProgressConsultationStatusCount(event: Event) {
    if (this.patientConsultation.inProgressStatusCount) {
      this.toastr.warning('There is already an ongoing consultation. Cannot proceed.', 'Warning!');
      this.patientConsultationForm.get('status').setValue(false);
      event.preventDefault();
      return;
    }
  }
}
