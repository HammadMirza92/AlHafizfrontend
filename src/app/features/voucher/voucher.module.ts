import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { VoucherListComponent } from './voucher-list/voucher-list.component';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { HazriFormComponent } from './hazri-form/hazri-form.component';
import { CashPaidFormComponent } from './cash-paid-form/cash-paid-form.component';
import { CashReceivedFormComponent } from './cash-received-form/cash-received-form.component';
import { VoucherDetailComponent } from './voucher-detail/voucher-detail.component';

const routes: Routes = [
  {
    path: '',
    component: VoucherListComponent
  },
  {
    path: 'purchase',
    children: [
      {
        path: '',
        component: VoucherListComponent,
        data: { voucherType: 1 }
      },
      {
        path: 'new',
        component: PurchaseFormComponent
      },
      {
        path: 'edit/:id',
        component: PurchaseFormComponent
      },
      {
        path: ':id',
        component: VoucherDetailComponent
      }
    ]
  },
  {
    path: 'sale',
    children: [
      {
        path: '',
        component: VoucherListComponent,
        data: { voucherType: 2 }
      },
      {
        path: 'new',
        component: SaleFormComponent
      },
      {
        path: 'edit/:id',
        component: SaleFormComponent
      },
      {
        path: ':id',
        component: VoucherDetailComponent
      }
    ]
  },
  {
    path: 'expense',
    children: [
      {
        path: '',
        component: VoucherListComponent,
        data: { voucherType: 3 }
      },
      {
        path: 'new',
        component: ExpenseFormComponent
      },
      {
        path: 'edit/:id',
        component: ExpenseFormComponent
      },
      {
        path: ':id',
        component: VoucherDetailComponent
      }
    ]
  },
  {
    path: 'hazri',
    children: [
      {
        path: '',
        component: VoucherListComponent,
        data: { voucherType: 4 }
      },
      {
        path: 'new',
        component: HazriFormComponent
      },
      {
        path: 'edit/:id',
        component: HazriFormComponent
      },
      {
        path: ':id',
        component: VoucherDetailComponent
      }
    ]
  },
  {
    path: 'cash-paid',
    children: [
      {
        path: '',
        component: VoucherListComponent,
        data: { voucherType: 5 }
      },
      {
        path: 'new',
        component: CashPaidFormComponent
      },
      {
        path: 'edit/:id',
        component: CashPaidFormComponent
      },
      {
        path: ':id',
        component: VoucherDetailComponent
      }
    ]
  },
  {
    path: 'cash-received',
    children: [
      {
        path: '',
        component: VoucherListComponent,
        data: { voucherType: 6 }
      },
      {
        path: 'new',
        component: CashReceivedFormComponent
      },
      {
        path: 'edit/:id',
        component: CashReceivedFormComponent
      },
      {
        path: ':id',
        component: VoucherDetailComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    VoucherListComponent,
    PurchaseFormComponent,
    SaleFormComponent,
    ExpenseFormComponent,
    HazriFormComponent,
    CashPaidFormComponent,
    CashReceivedFormComponent,
    VoucherDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class VoucherModule { }
