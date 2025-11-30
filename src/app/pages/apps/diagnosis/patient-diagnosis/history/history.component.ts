import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-history',
  imports: [],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit, OnChanges {

  @Input() patientId: number | null = null;


  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patientId'] && changes['patientId'].currentValue) {
      if (this.patientId) {

      }
    }
  }
}
