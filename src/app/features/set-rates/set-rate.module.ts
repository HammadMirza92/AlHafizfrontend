import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { RateManagementComponent } from './rate-management/rate-management.component';
import { SetRateDialogComponent } from './set-rate-dialog/set-rate-dialog.component';
import { CustomerRateDialogComponent } from './customer-rate-dialog/customer-rate-dialog.component';
import { ItemRateDialogComponent } from './item-rate-dialog/item-rate-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: RateManagementComponent
  }


];

@NgModule({
  declarations: [
    RateManagementComponent,
    SetRateDialogComponent,
    CustomerRateDialogComponent,
    ItemRateDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SetRatesModule { }
