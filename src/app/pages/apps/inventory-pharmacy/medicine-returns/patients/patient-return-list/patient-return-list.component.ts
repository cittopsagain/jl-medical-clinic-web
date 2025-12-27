import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";

@Component({
  selector: 'app-patient-return-list',
  imports: [
    MatTab,
    MatTabGroup
  ],
  templateUrl: './patient-return-list.component.html',
  styleUrl: './patient-return-list.component.scss'
})
export class PatientReturnListComponent {

}
