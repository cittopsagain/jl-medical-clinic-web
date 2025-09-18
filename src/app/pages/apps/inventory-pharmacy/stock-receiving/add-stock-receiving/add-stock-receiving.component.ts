import {Component, ViewChild} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {DecimalPipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {HeaderComponent} from "./header/header.component";
import {DetailsComponent} from "./details/details.component";
import {ItemsComponent} from "./items/items.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {StockReceivingService} from "../services/stock-receiving.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-add-stock-receiving',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    DecimalPipe,
    MatButton,
    RouterLink,
    HeaderComponent,
    DetailsComponent,
    ItemsComponent,
    MatTab,
    MatTabGroup
  ],
  templateUrl: './add-stock-receiving.component.html',
  styleUrl: './add-stock-receiving.component.scss'
})
export class AddStockReceivingComponent {

  @ViewChild(HeaderComponent) header: HeaderComponent;
  @ViewChild(DetailsComponent) details: DetailsComponent;
  @ViewChild(ItemsComponent) items: ItemsComponent;

  constructor(private stockReceivingService: StockReceivingService, private toastR: ToastrService) {

  }

  ngAfterViewInit() {
    this.items.items = []; // Reset items when component is initialized
  }

  saveStock() {
    let agentId = this.header.selectedAgentId;
    let supplierId = this.header.selectedSupplierId;
    let header = this.header.headerForm.value;
    let items = this.items.items;

    this.stockReceivingService.saveStocks({
      agentId: agentId,
      supplierId: supplierId,
      invoiceNo: header.invoiceNo,
      invoiceDate: this.formatInvoiceDate(header.invoiceDate),
      discount: header.discount,
      terms: header.terms,
      details: items
    }).subscribe({
      next: (res) => {
        if (res.statusCode != 200) {
          this.toastR.error(res.message || 'Failed to save stock.', 'Error');
          return;
        }

        this.toastR.success(res.message, 'Success');

        this.header.headerForm.reset();
        this.details.detailForm.reset();
        this.items.items = [];
      },
      error: (err) => {
        this.toastR.error(err.message || 'Failed to save stock.', 'Error');
      }
    })
  }

  private formatInvoiceDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day: string = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
