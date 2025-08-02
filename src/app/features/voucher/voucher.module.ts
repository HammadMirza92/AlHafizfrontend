// src/app/features/voucher/voucher.module.ts
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Purchase components
import { PurchaseFormComponent } from './purchase/purchase-form/purchase-form.component';
import { PurchaseListComponent } from './purchase/purchase-list/purchase-list.component';
import { PurchaseDetailComponent } from './purchase/purchase-detail/purchase-detail.component';

// Sale components
import { SaleFormComponent } from './sale/sale-form/sale-form.component';
import { SaleListComponent } from './sale/sale-list/sale-list.component';
import { SaleDetailComponent } from './sale/sale-detail/sale-detail.component';

// Expense components
import { ExpenseFormComponent } from './expense/expense-form/expense-form.component';
import { ExpenseListComponent } from './expense/expense-list/expense-list.component';
import { ExpenseDetailComponent } from './expense/expense-detail/expense-detail.component';

// Hazri components
import { HazriFormComponent } from './hazri/hazri-form/hazri-form.component';
import { HazriListComponent } from './hazri/hazri-list/hazri-list.component';
import { HazriDetailComponent } from './hazri/hazri-detail/hazri-detail.component';

// Cash Paid components
import { CashPaidFormComponent } from './cash-paid/cash-paid-form/cash-paid-form.component';
import { CashPaidListComponent } from './cash-paid/cash-paid-list/cash-paid-list.component';
import { CashPaidDetailComponent } from './cash-paid/cash-paid-detail/cash-paid-detail.component';

// Cash Received components
import { CashReceivedFormComponent } from './cash-received/cash-received-form/cash-received-form.component';
import { CashReceivedListComponent } from './cash-received/cash-received-list/cash-received-list.component';
import { CashReceivedDetailComponent } from './cash-received/cash-received-detail/cash-received-detail.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

const routes: Routes = [
  { path: '', redirectTo: 'purchase', pathMatch: 'full' },
  {
    path: 'purchase',
    children: [
      { path: '', component: PurchaseListComponent },
      { path: 'new', component: PurchaseFormComponent },
      { path: 'edit/:id', component: PurchaseFormComponent },
      { path: ':id', component: PurchaseDetailComponent }
    ]
  },
  {
    path: 'sale',
    children: [
      { path: '', component: SaleListComponent },
      { path: 'new', component: SaleFormComponent },
      { path: 'edit/:id', component: SaleFormComponent },
      { path: ':id', component: SaleDetailComponent }
    ]
  },
  {
    path: 'expense',
    children: [
      { path: '', component: ExpenseListComponent },
      { path: 'new', component: ExpenseFormComponent },
      { path: 'edit/:id', component: ExpenseFormComponent },
      { path: ':id', component: ExpenseDetailComponent }
    ]
  },
  {
    path: 'hazri',
    children: [
      { path: '', component: HazriListComponent },
      { path: 'new', component: HazriFormComponent },
      { path: 'edit/:id', component: HazriFormComponent },
      { path: ':id', component: HazriDetailComponent }
    ]
  },
  {
    path: 'cash-paid',
    children: [
      { path: '', component: CashPaidListComponent },
      { path: 'new', component: CashPaidFormComponent },
      { path: 'edit/:id', component: CashPaidFormComponent },
      { path: ':id', component: CashPaidDetailComponent }
    ]
  },
  {
    path: 'cash-received',
    children: [
      { path: '', component: CashReceivedListComponent },
      { path: 'new', component: CashReceivedFormComponent },
      { path: 'edit/:id', component: CashReceivedFormComponent },
      { path: ':id', component: CashReceivedDetailComponent }
    ]
  }
];

@NgModule({
  declarations: [
    // Purchase components
    PurchaseFormComponent,
    PurchaseListComponent,
    PurchaseDetailComponent,

    // Sale components
    SaleFormComponent,
    SaleListComponent,
    SaleDetailComponent,

    // Expense components
    ExpenseFormComponent,
    ExpenseListComponent,
    ExpenseDetailComponent,

    // Hazri components
    HazriFormComponent,
    HazriListComponent,
    HazriDetailComponent,

    // Cash Paid components
    CashPaidFormComponent,
    CashPaidListComponent,
    CashPaidDetailComponent,

    // Cash Received components
    CashReceivedFormComponent,
    CashReceivedListComponent,
    CashReceivedDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule.forChild(routes)
  ],providers: [
    // Other providers...
    DatePipe, // Add DatePipe to providers
  ],
})
export class VoucherModule { }
