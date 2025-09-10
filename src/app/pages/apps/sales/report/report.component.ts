import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatOption, provideNativeDateAdapter} from "@angular/material/core";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatDivider} from "@angular/material/divider";
import {ReportService} from "./report.service";
import {ToastrService} from "ngx-toastr";
import {MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-report',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardHeader,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDivider,
    MatOption,
    MatSelect
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

  dateFrom: string;
  dateTo: string;
  reportType: string = '';
  type: string[] = [
    'Summary',
    'Detail'
  ];

  constructor(private reportService: ReportService, private toastR: ToastrService) {

  }

  ngAfterViewInit() {

  }

  generateReport() {
    console.log('Report Type: ', this.reportType);
    if (this.reportType === 'Summary') {
      this.getSalesReport();
    }

    if (this.reportType === 'Detail') {
      this.getDetailSalesReport();
    }
  }

  public getSalesReport() {
    this.reportService.getSalesReport(
      this.formatDate(new Date(this.dateFrom)),
      this.formatDate(new Date(this.dateTo))
    ).subscribe({
      next: (res: any) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        const issuedDate = this.formatDate(new Date());

        // Trigger download
        /* const a = document.createElement('a');
        a.href = fileURL;
        a.download = `SalesReport_${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); */

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (err) => {
        console.log(err);
        this.toastR.error(err.error.message, 'Oops!');
      }
    });
  }

  public getDetailSalesReport() {
    this.reportService.getDetailSalesReport(
      this.formatDate(new Date(this.dateFrom)),
      this.formatDate(new Date(this.dateTo))
    ).subscribe({
      next: (res: any) => {
        const file = new Blob([res], {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes');

        const issuedDate = this.formatDate(new Date());

        // Trigger download
        /* const a = document.createElement('a');
        a.href = fileURL;
        a.download = `SalesReport_${issuedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); */

        // Cleanup
        URL.revokeObjectURL(fileURL);
      },
      error: (err) => {
        console.log(err);
        this.toastR.error(err.error.message, 'Oops!');
      }
    });
  }

  // Todo: Transfer it to utility class
  formatDate(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Todo: Transfer it to utility class
  formatDateToYYYYMMDD(dateStr: string): string {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
}
