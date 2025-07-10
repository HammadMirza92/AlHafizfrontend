// customer-item-rate.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerItemRateService {
  private path = 'api/RateManagement';

  constructor(private apiService: ApiService) { }

  getAllRates(): Observable<any[]> {
    return this.apiService.get<any[]>(this.path);
  }

  getRatesByCustomer(customerId: number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.path}/customer/${customerId}`);
  }

  getRatesByItem(itemId: number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.path}/item/${itemId}`);
  }

  getRateByCustomerAndItem(customerId: number, itemId: number): Observable<any> {
    return this.apiService.get<any>(`${this.path}/get-rate/${customerId}/${itemId}`);
  }

  setRate(rate: {customerId: number, itemId: number, rate: number}): Observable<void> {
    return this.apiService.post<void, any>(`${this.path}/set-rate`, rate);
  }

  getRateMatrix(): Observable<any> {
    return this.apiService.get<any>(`${this.path}/matrix`);
  }
}
