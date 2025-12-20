import {Component, ElementRef, ViewChild} from '@angular/core';
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
  selectedSupplierName: string;

  agentGroups: GroupedAgents[] = [];
  agentGroupOptions: Observable<GroupedAgents[]>;

  supplierGroups: GroupedSuppliers[] = [];
  supplierGroupOptions: Observable<GroupedSuppliers[]>;

  selectedAgentId: number | null = null;
  selectedSupplierId: number | null = null;

  @ViewChild('agentNameInput') agentNameInput: ElementRef;
  @ViewChild('supplierNameInput') supplierNameInput: ElementRef;

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
      supplierGroup: ['', Validators.required],
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
        this.suppliers = data.data.suppliers || [];

        this.agents = data.data.agents || [];

        /* this.agentGroups = this.groupByFirstLetter(data.data.agents || []);
        this.setAgentFilter(); */

        this.supplierGroups = this.groupSupplierByFirstLetter(data.data.suppliers || []);
        this.setSupplierFilter();
      },
      error: error => {
        this.toastR.error(error.error?.message || 'Failed to load agents', 'Error');
      }
    });
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

  groupSupplierByFirstLetter(data: Supplier[]): GroupedSuppliers[] {
    const grouped = data.reduce<Record<string, GroupedSuppliers>>((acc, item) => {
      const firstLetter = item.supplierName[0].toUpperCase();

      if (!acc[firstLetter]) {
        acc[firstLetter] = { letter: firstLetter, names: [] };
      }

      // Only add the agent name if it doesn't agentName exist in the array
      if (!acc[firstLetter].names.includes(item.supplierName)) {
        acc[firstLetter].names.push(item.supplierName);
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

  setSupplierFilter() {
    this.supplierGroupOptions = this.headerForm
      .get('supplierGroup')!
      .valueChanges.pipe(
        startWith(''),
        map((value: string | null) => this._filterSupplierGroup(value || ''))
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

  private _filterSupplierGroup(value: string): GroupedSuppliers[] {
    this.selectedSupplierName = ''; // Reset the selected Supplier Name when filtering
    this.selectedAgentName = '';
    this.selectedAgentId = null;
    this.selectedSupplierId = null;

    // this.agents = [];

    if (value) {
      const filteredGroups = this.supplierGroups
        .map((group) => ({
          letter: group.letter,
          names: _filter(group.names, value),
        }))
        .filter((group) => group.names.length > 0);

      if (filteredGroups.length <= 0) {
        this.toastR.warning('Supplier not found in the list', 'Invalid Input');
        this.agentNameInput.nativeElement.value = '';
        return [];
      }

      return filteredGroups;
    }

    return this.supplierGroups;
  }

  onInputAgentClick() {
    const agents= this.agents.filter(b => b.supplierId === this.selectedSupplierId);

    this.agentGroups = this.groupByFirstLetter(agents || []);
    this.setAgentFilter();
  }

  onInputSupplierClick() {
    if (this.supplierNameInput.nativeElement.value === '') {
      this.agentNameInput.nativeElement.value = '';
      this.selectedSupplierId = null;
      this.selectedAgentId = null;
    }
  }

  onAgentSelected(selected: string) {
    this.selectedAgentName = selected;
    const found = this.agents.find(b => b.agentName.toLowerCase() === selected.toLowerCase());
    const supplierId = found ? found.supplierId : null;

    const supplier = this.suppliers.find(b => b.supplierId === supplierId);

    this.headerForm.patchValue({
      supplierId: supplierId,
      supplier: supplier ? supplier.supplierName : '',
      agentId: found.agentId
    });

    this.selectedAgentId = found.agentId;
    this.selectedSupplierId = supplierId;
  }

  onSupplierSelected(selected: string) {
    this.selectedSupplierName = selected;
    this.selectedAgentName = '';
    this.selectedAgentId = null;

    const found = this.suppliers.find(b => b.supplierName.toLowerCase() === selected.toLowerCase());
    const supplierId = found ? found.supplierId : null;

    const supplier = this.suppliers.find(b => b.supplierId === supplierId);

    this.headerForm.patchValue({
      supplier: supplier ? supplier.supplierName : ''
    });

    this.selectedSupplierId = supplierId;
    // this.agents = [];
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

type Supplier = {
  supplierId: number;
  supplierName: string;
}

type GroupedAgents = {
  letter: string;
  names: string[];
};

type GroupedSuppliers = {
  letter: string;
  names: string[];
}
