import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BankListComponent } from './bank-list/bank-list.component';
import { BankFormComponent } from './bank-form/bank-form.component';

const routes: Routes = [
  {
    path: '',
    component: BankListComponent
  },
  {
    path: 'new',
    component: BankFormComponent
  },
  {
    path: 'edit/:id',
    component: BankFormComponent
  }
];

@NgModule({
  declarations: [
    BankListComponent,
    BankFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class BankModule { }
