import {Component, ElementRef, ViewChild} from '@angular/core';
import {Header, StockReceivingService} from "../services/stock-receiving.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge, Observable, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {AsyncPipe, DatePipe, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {TablerIconComponent} from "angular-tabler-icons";
import {ToastrService} from "ngx-toastr";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-stock-receiving-list',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatInput,
    MatLabel,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    TablerIconComponent,
    UpperCasePipe,
    MatFormField,
    MatHeaderCellDef,
    RouterLink,
    DatePipe
  ],
  templateUrl: './stock-receiving-list.component.html',
  styleUrl: './stock-receiving-list.component.scss'
})
export class StockReceivingListComponent {

  data: Header[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isError = false;
  pageSize = 30;
  errorMessage: string = 'Problem loading data. Please try again later.';

  @ViewChild('supplierNameInput') supplierNameInput: ElementRef;

  @ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
  @ViewChild(MatSort) sort: MatSort = Object.create(null);

  displayedColumns: string[] = ['number', 'purchaseNo', 'invoiceNo', 'invoiceDate', 'supplier', 'agent', 'dateCreated', 'action'];

  constructor(private stockReceivingService: StockReceivingService, private toastR: ToastrService) {

  }

  ngAfterViewInit() {
    this.getStockReceivingList();
  }

  getStockReceivingList() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.stockReceivingService.getStockReceivingHeader(
            {
              supplierName: this.supplierNameInput.nativeElement.value
            },
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex);
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.isError = false;
          this.resultsLength = data.data.totalCount;

          return data.data.items;
        }),
        catchError((error: any) => {
          this.toastR.error(error.error?.message || 'Failed to load stock receiving', 'Error');
          this.paginator.pageIndex = 0;

          this.isLoadingResults = false;
          this.isError = true;

          return observableOf([]);
        })
      )
      .subscribe((data: Header[]) => (this.data = data));;
  }

  applyFilter() {
    this.paginator.pageIndex = 0;
    this.getStockReceivingList();
  }
}
