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
    navCap: 'Billing/Payments',
  },
  {
    displayName: 'Payment Processing',
    iconName: 'credit-card-pay',
    //route: 'apps/chat',
  },
  {
    displayName: 'Invoice Generation',
    iconName: 'invoice',
    //route: 'apps/chat',
  },
  {
    navCap: 'Diagnosis',
  },
  {
    displayName: 'Patient Diagnosis',
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
    displayName: 'Items',
    iconName: 'clipboard-list',
    //route: 'front-pages/homepage',
  },
  {
    displayName: 'Stock Management',
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
