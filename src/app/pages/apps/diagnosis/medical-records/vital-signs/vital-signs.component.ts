import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {VitalSignsService} from "./vital-signs.service";
import {VitalSigns} from "../medical-records.service";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-vital-signs',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    MatFormField
  ],
  templateUrl: './vital-signs.component.html',
  styleUrl: './vital-signs.component.scss'
})
export class VitalSignsComponent implements OnDestroy{

  @Input() vitalSigns: VitalSigns;

  constructor(private vitalSignsService: VitalSignsService) {

  }

  ngAfterViewInit() {
    this.vitalSignsService.vitalSigns$.subscribe(vitalSigns => {
      if (vitalSigns) {
        this.vitalSigns = vitalSigns;
      }
    });
  }

  ngOnDestroy(): void {

  }

}
