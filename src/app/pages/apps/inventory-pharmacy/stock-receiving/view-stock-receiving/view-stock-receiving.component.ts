import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DetailsComponent} from "../add-stock-receiving/details/details.component";
import {HeaderComponent} from "../add-stock-receiving/header/header.component";
import {ItemsComponent} from "../add-stock-receiving/items/items.component";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {StockReceivingService} from "../services/stock-receiving.service";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {TablerIconComponent} from "angular-tabler-icons";
import {MatSort} from "@angular/material/sort";
import {UpperCasePipe} from "@angular/common";

@Component({
  selector: 'app-view-stock-receiving',
  imports: [
    DetailsComponent,
    HeaderComponent,
    ItemsComponent,
    MatButton,
    MatCard,
    MatCardContent,
    MatTab,
    MatTabGroup,
    RouterLink,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    TablerIconComponent,
    MatHeaderCellDef,
    UpperCasePipe
  ],
  templateUrl: './view-stock-receiving.component.html',
  styleUrl: './view-stock-receiving.component.scss'
})
export class ViewStockReceivingComponent implements OnChanges {

  headerForm: UntypedFormGroup | any;
  displayedColumns: string[] = ['medicineName', 'unit', 'batchNo', 'quantity', 'price', 'free', 'lotNumber', 'expiryDate'];
  items: any[] = [];

  @Input() purchaseId: number;

  constructor(private fb: UntypedFormBuilder, private stockReceivingService: StockReceivingService,
              private toastR: ToastrService, private route: ActivatedRoute) {
    this.headerForm = this.fb.group({
      agent: [''],
      invoiceNo: [''],
      invoiceDate: [''],
      supplier: [''],
      discount: [''],
      terms: ['']
    });

    // From: Router
    // const id: number = Number(this.route.snapshot.paramMap.get('id'));
    // this.getStockReceivingByPurchaseId(id);
  }

  ngAfterViewInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['purchaseId'] && changes['purchaseId'].currentValue) {
      this.getStockReceivingByPurchaseId(this.purchaseId);
    }
  }

  getStockReceivingByPurchaseId(purchaseId: number) {
    this.stockReceivingService.getStockReceivingByPurchaseId(purchaseId)
      .subscribe({
        next: data => {
          this.headerForm.patchValue({
            agent: data.data.header.agentName,
            invoiceNo: data.data.header.invoiceNumber,
            invoiceDate: data.data.header.invoiceDate,
            supplier: data.data.header.supplierName,
            discount: data.data.header.discountPercent,
            terms: data.data.header.terms,
          });

          this.items = data.data.details || [];
        },
        error: error => {
          this.toastR.error(error.message || 'Failed to retrieve stock', 'Error');
        }
      });
  }
}
