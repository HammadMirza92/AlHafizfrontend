import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'customers',
        loadChildren: () => import('./features/customer/customer.module').then(m => m.CustomerModule)
      },
      {
        path: 'items',
        loadChildren: () => import('./features/item/item.module').then(m => m.ItemModule)
      },
      {
        path: 'banks',
        loadChildren: () => import('./features/bank/bank.module').then(m => m.BankModule)
      },
      {
        path: 'expense-heads',
        loadChildren: () => import('./features/expense-head/expense-head.module').then(m => m.ExpenseHeadModule)
      },
      {
        path: 'vouchers',
        loadChildren: () => import('./features/voucher/voucher.module').then(m => m.VoucherModule)
      },
      {
        path: 'stock',
        loadChildren: () => import('./features/stock/stock.module').then(m => m.StockModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/report/report.module').then(m => m.ReportModule)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
