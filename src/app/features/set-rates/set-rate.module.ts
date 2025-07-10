import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { RateManagementComponent } from './rate-management/rate-management.component';

const routes: Routes = [
  {
    path: '',
    component: RateManagementComponent
  }


];

@NgModule({
  declarations: [
    RateManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SetRatesModule { }
