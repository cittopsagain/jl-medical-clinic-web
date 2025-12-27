import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {PatientReturnListComponent} from "./patients/patient-return-list/patient-return-list.component";

@Component({
  selector: 'app-medicine-returns',
  imports: [
    MatTabGroup,
    MatTab,
    PatientReturnListComponent
  ],
  templateUrl: './medicine-returns.component.html',
  styleUrl: './medicine-returns.component.scss'
})
export class MedicineReturnsComponent {

}
