import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExpenseHeadListComponent } from './expense-head-list/expense-head-list.component';
import { ExpenseHeadFormComponent } from './expense-head-form/expense-head-form.component';

const routes: Routes = [
  {
    path: '',
    component: ExpenseHeadListComponent
  },
  {
    path: 'new',
    component: ExpenseHeadFormComponent
  },
  {
    path: 'edit/:id',
    component: ExpenseHeadFormComponent
  }
];

@NgModule({
  declarations: [
    ExpenseHeadListComponent,
    ExpenseHeadFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ExpenseHeadModule { }
