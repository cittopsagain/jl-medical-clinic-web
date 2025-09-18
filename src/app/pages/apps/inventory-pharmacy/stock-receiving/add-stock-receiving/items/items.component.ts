import {Component, OnDestroy, OnInit} from '@angular/core';
import {ItemsService} from "./items.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {TablerIconComponent} from "angular-tabler-icons";
import {DatePipe, UpperCasePipe} from "@angular/common";
import {MatSort} from "@angular/material/sort";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-items',
  imports: [
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
    MatHeaderCellDef
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnDestroy, OnInit {

  private subscription: Subscription;
  displayedColumns: string[] = ['medicineName', 'unit', 'batchNo', 'quantity', 'price', 'free', 'lotNumber', 'expiryDate', 'action'];
  items: any[] = [];

  constructor(private itemsService: ItemsService) {

  }

  ngOnInit() {
    this.subscription = this.itemsService.items$.subscribe(items => {
      if (items) {
        const newItems = Array.isArray(items) ? items : [items];
        this.items = [...this.items, ...newItems];
      }
    });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeItem(index: number) {
    for (let i = 0; i < this.items.length; i++) {
      if (i == index) {
        console.log('Found!');
        this.items = this.items.filter((_, i) => i !== index);
        break;
      }
    }
  }

  editItem(row: any) {

  }
}
