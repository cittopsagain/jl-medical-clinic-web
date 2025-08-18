import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'aperture',
    // route: '/dashboards/dashboard1',
  },
  {
    navCap: 'Patient Management',
  },
  {
    displayName: 'Patient Records',
    iconName: 'logs',
    route: 'apps/patient-management/patient-records'
  },
  {
    displayName: 'Patient Consultation',
    iconName: 'stethoscope',
    route: 'apps/patient-management/patient-consultation',
  },
  {
    navCap: 'Sales',
  },
  {
    displayName: 'Point of Sale',
    iconName: 'cash-register',
    route: 'apps/sales/pos',
  },
  {
    displayName: 'Consultation Fees',
    iconName: 'cash',
    //route: 'apps/chat',
  },
  {
    navCap: 'Diagnosis',
  },
  {
    displayName: 'Patient Diagnosis & Records',
    iconName: 'clipboard-heart',
    route: 'apps/diagnosis/patient-diagnosis',
  },
  {
    navCap: 'Medical Records',
  },
  {
    displayName: 'Medical Certificate',
    iconName: 'certificate',
    //route: 'front-pages/homepage'
  },
  {
    navCap: 'Inventory/Pharmacy',
  },
  {
    displayName: 'Suppliers',
    iconName: 'users-group',
    //route: 'front-pages/homepage',
  },
  {
    displayName: 'Brands',
    iconName: 'tag',
    route: 'apps/inventory-pharmacy/brands',
  },
  {
    displayName: 'Medicines',
    iconName: 'pill',
    //route: 'front-pages/homepage',
  },
  {
    displayName: 'Stock Adjustments',
    iconName: 'clipboard',
    route: 'apps/inventory-pharmacy/stock-adjustments',
  },
  {
    displayName: 'Stock Receiving',
    iconName: 'building-warehouse'
  },
  {
    displayName: 'Expiration Date Monitoring',
    iconName: 'calendar-x',
  },
  {
    navCap: 'Reporting',
  },
  {
    displayName: 'Financial Reports',
    iconName: 'chart-histogram',
    //route: 'front-pages/homepage'
  }
];
