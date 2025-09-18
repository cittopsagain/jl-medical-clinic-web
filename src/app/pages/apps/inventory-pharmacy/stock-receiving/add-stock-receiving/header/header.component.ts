import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatOptgroup, MatOption, provideNativeDateAdapter} from "@angular/material/core";
import {StockReceivingService} from "../../services/stock-receiving.service";
import {ToastrService} from "ngx-toastr";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {AsyncPipe} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOptgroup,
    MatOption,
    MatSelect
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  headerForm: UntypedFormGroup | any;
  agents: any[] = [];
  suppliers: any[] = [];
  selectedAgentName: string;

  agentGroups: GroupedAgents[] = [];
  agentGroupOptions: Observable<GroupedAgents[]>;

  selectedAgentId: number | null = null;
  selectedSupplierId: number | null = null;

  terms: any[] = [
    {
      id: 1, name: 'COD'
    },
    {
      id: 2, name: '30 Days'
    },
    {
      id: 3, name: '60 Days'
    }
  ];

  constructor(private fb: UntypedFormBuilder, private stockReceivingService: StockReceivingService,
              private toastR: ToastrService) {
    this.headerForm = this.fb.group({
      agentGroup: ['', Validators.required],
      invoiceNo: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      invoiceDate: ['', Validators.required],
      supplier: ['', Validators.required],
      discount: [''],
      terms: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.getAgents();
  }

  getAgents() {
    this.stockReceivingService.getAgents().subscribe({
      next: data => {
        this.agents = data.data.agents || [];
        this.suppliers = data.data.suppliers || [];

        this.agentGroups = this.groupByFirstLetter(data.data.agents || []);
        this.setAgentFilter();
      },
      error: error => {
        this.toastR.error(error.error?.message || 'Failed to load agents', 'Error');
      }
    })
  }

  groupByFirstLetter(data: Agent[]): GroupedAgents[] {
    const grouped = data.reduce<Record<string, GroupedAgents>>((acc, item) => {
      const firstLetter = item.agentName[0].toUpperCase();

      if (!acc[firstLetter]) {
        acc[firstLetter] = { letter: firstLetter, names: [] };
      }

      // Only add the agent name if it doesn't agentName exist in the array
      if (!acc[firstLetter].names.includes(item.agentName)) {
        acc[firstLetter].names.push(item.agentName);
      }
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.letter.localeCompare(b.letter));
  }

  setAgentFilter() {
    this.agentGroupOptions = this.headerForm
      .get('agentGroup')!
      .valueChanges.pipe(
        startWith(''),
        map((value: string | null) => this._filterGroup(value || ''))
      );
  }

  private _filterGroup(value: string): GroupedAgents[] {
    this.selectedAgentName = ''; // Reset the selected Agent Name when filtering
    this.selectedAgentId = null;
    this.selectedSupplierId = null;

    if (value) {
      const filteredGroups = this.agentGroups
        .map((group) => ({
          letter: group.letter,
          names: _filter(group.names, value),
        }))
        .filter((group) => group.names.length > 0);

      if (filteredGroups.length <= 0) {
        this.toastR.warning('Agent not found in the list', 'Invalid Input');

        return [];
      }

      return filteredGroups;
    }

    return this.agentGroups;
  }

  onAgentSelected(selected: string) {
    this.selectedAgentName = selected;
    const found = this.agents.find(b => b.agentName.toLowerCase() === selected.toLowerCase());
    const supplierId = found ? found.supplierId : null;

    const supplier = this.suppliers.find(b => b.supplierId === supplierId);

    this.headerForm.patchValue({
     supplier: supplier ? supplier.supplierName : ''
    });

    this.selectedAgentId = found.agentId;
    this.selectedSupplierId = supplierId;
  }
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter((item) => item.toLowerCase().includes(filterValue));
};

type Agent = {
  agentId: number;
  agentName: string;
}

type GroupedAgents = {
  letter: string;
  names: string[];
};
