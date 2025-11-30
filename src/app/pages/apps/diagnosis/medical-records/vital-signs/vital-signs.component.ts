import {Component, OnDestroy} from '@angular/core';
import {VitalSignsService} from "./vital-signs.service";
import {VitalSigns} from "../medical-records.service";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";

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

  vitalSigns: VitalSigns | any = null;

  constructor(private vitalSignsService: VitalSignsService) {
    this.vitalSignsService.vitalSigns$.subscribe(vitalSigns => {
      this.vitalSigns = null;
      if (vitalSigns) {
        this.vitalSigns = vitalSigns;
      }
    });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy(): void {

  }

}
