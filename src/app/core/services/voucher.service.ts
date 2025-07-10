import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Voucher, CreateVoucher, UpdateVoucher, VoucherFilter } from '../models/voucher.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private path = 'api/voucher';

  constructor(private apiService: ApiService) { }

  getVouchers(): Observable<Voucher[]> {
    return this.apiService.get<Voucher[]>(this.path);
  }

  getVoucher(id: number): Observable<Voucher> {
    return this.apiService.get<Voucher>(`${this.path}/${id}`);
  }

  createVoucher(voucher: CreateVoucher): Observable<Voucher> {
    return this.apiService.post<Voucher, CreateVoucher>(this.path, voucher);
  }

  updateVoucher(id: number, voucher: any): Observable<Voucher> {
    return this.apiService.put<Voucher, UpdateVoucher>(`${this.path}/${id}`, voucher);
  }

  deleteVoucher(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.path}/${id}`);
  }

  filterVouchers(filter: VoucherFilter): Observable<Voucher[]> {
    let params = new HttpParams();

    if (filter.fromDate) {
      params = params.set('fromDate', filter.fromDate.toISOString());
    }

    if (filter.toDate) {
      params = params.set('toDate', filter.toDate.toISOString());
    }

    if (filter.customerId) {
      params = params.set('customerId', filter.customerId.toString());
    }

    if (filter.expenseHeadId) {
      params = params.set('expenseHeadId', filter.expenseHeadId.toString());
    }

    if (filter.voucherType) {
      params = params.set('voucherType', filter.voucherType.toString());
    }

    return this.apiService.get<Voucher[]>(`${this.path}/filter`, params);
  }

}
