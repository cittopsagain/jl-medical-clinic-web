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
    displayName: 'Consultations & Follow-ups',
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
    displayName: 'Diagnosis & Records',
    iconName: 'clipboard-heart',
    route: 'apps/diagnosis/patient-diagnosis/0',
  },
  /*{
    navCap: 'Medical Records',
  },
  {
    displayName: 'Medical Certificate',
    iconName: 'certificate',
    //route: 'front-pages/homepage'
  },*/
  {
    navCap: 'Pharmacy',
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
    route: 'apps/inventory-pharmacy/medicines',
  },
  /*{
    displayName: 'Medicine Dosage',
    iconName: 'pill',
    route: 'apps/inventory-pharmacy/medicines1',
  },*/
  {
    displayName: 'Stock Adjustments',
    iconName: 'clipboard',
    route: 'apps/inventory-pharmacy/stock-adjustments',
  },
  {
    displayName: 'Stock Receiving',
    iconName: 'building-warehouse',
    route: 'apps/inventory-pharmacy/stock-receiving',
  },
  /*{
    displayName: 'Stock Card Viewer',
    iconName: 'building-warehouse',
    route: 'apps/inventory-pharmacy/stock-receiving',
  },*/
  {
    displayName: 'Expiration Date Monitoring',
    iconName: 'calendar-x',
  },
  {
    navCap: 'Reporting',
  },
  {
    displayName: 'Sales Report',
    iconName: 'chart-histogram',
    route: 'apps/sales/report'
  }
];
