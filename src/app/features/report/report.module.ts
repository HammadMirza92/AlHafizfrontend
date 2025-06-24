import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
import { SaleReportComponent } from './sale-report/sale-report.component';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { HazriReportComponent } from './hazri-report/hazri-report.component';
import { CashReportComponent } from './cash-report/cash-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportDashboardComponent
  },
  {
    path: 'purchase',
    component: PurchaseReportComponent
  },
  {
    path: 'sale',
    component: SaleReportComponent
  },
  {
    path: 'expense',
    component: ExpenseReportComponent
  },
  {
    path: 'hazri',
    component: HazriReportComponent
  },
  {
    path: 'cash',
    component: CashReportComponent
  }
];

@NgModule({
  declarations: [
    ReportDashboardComponent,
    PurchaseReportComponent,
    SaleReportComponent,
    ExpenseReportComponent,
    HazriReportComponent,
    CashReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ReportModule { }
