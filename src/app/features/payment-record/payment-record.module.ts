import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CashTransactionListComponent } from './payment-record-list/cash-transaction-list.component';
import { CashTransactionFilterComponent } from './payment-type-filter/cash-transaction-filter.component';
import { CashTransactionFormComponent } from './cash-transaction-form/cash-transaction-form.component';


const routes: Routes = [
  {
    path: '',
    component: CashTransactionListComponent
  },
   {
    path: 'cashTransaction',
    component: CashTransactionFilterComponent
  },

];

@NgModule({
  declarations: [
    CashTransactionListComponent,
    CashTransactionFilterComponent,
    CashTransactionFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class paymentRecordModule { }
