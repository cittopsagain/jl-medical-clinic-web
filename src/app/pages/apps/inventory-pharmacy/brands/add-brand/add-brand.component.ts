import { Component } from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-add-brand',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatDivider,
    RouterLink
  ],
  templateUrl: './add-brand.component.html',
  styleUrl: './add-brand.component.scss'
})
export class AddBrandComponent {

}
