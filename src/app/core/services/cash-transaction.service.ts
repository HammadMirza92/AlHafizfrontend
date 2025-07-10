import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CashTransaction, CreateCashTransaction, CashTransactionFilter } from '../models/cash-transaction.model';
import { HttpParams } from '@angular/common/http';
import { PaymentType } from '../models/enums.model';

@Injectable({
  providedIn: 'root'
})
export class CashTransactionService {
  private path = 'api/cashtransaction';

  constructor(private apiService: ApiService) { }

  getCashTransactions(): Observable<CashTransaction[]> {
    return this.apiService.get<CashTransaction[]>(this.path);
  }

  getCashTransaction(id: number): Observable<CashTransaction> {
    return this.apiService.get<CashTransaction>(`${this.path}/${id}`);
  }

  createCashTransaction(cashTransaction: CreateCashTransaction): Observable<CashTransaction> {
    return this.apiService.post<CashTransaction, CreateCashTransaction>(this.path, cashTransaction);
  }

  updateCashTransaction(id: number, cashTransaction: CreateCashTransaction): Observable<void> {
    return this.apiService.put<void, CreateCashTransaction>(`${this.path}/${id}`, cashTransaction);
  }

  deleteCashTransaction(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.path}/${id}`);
  }

  filterCashTransactions(filter: CashTransactionFilter): Observable<CashTransaction[]> {
    debugger;
    let params = new HttpParams();

    if (filter.fromDate) {
      params = params.set('fromDate', filter.fromDate.toISOString());
    }

    if (filter.toDate) {
      params = params.set('toDate', filter.toDate.toISOString());
    }

    if (filter.customerId != null) {
      params = params.set('customerId', filter.customerId.toString());
    }

    if (filter.paymentType != null)  {
      params = params.set('paymentType', filter.paymentType.toString());
    }

    if (filter.isCashReceived !== null && filter.isCashReceived !== undefined) {
      params = params.set('isCashReceived', filter.isCashReceived.toString());
    }

    return this.apiService.get<CashTransaction[]>(`${this.path}/filter`, params);
  }

  filterTransactionsByCustomerAndDate(customerId: number, fromDate?: Date, toDate?: Date, paymentType?: PaymentType): Observable<CashTransaction[]> {
    let params = new HttpParams().set('customerId', customerId.toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate.toISOString());
    }

    if (toDate) {
      params = params.set('toDate', toDate.toISOString());
    }

    if (paymentType) {
      params = params.set('paymentType', paymentType.toString());
    }

    return this.apiService.get<CashTransaction[]>(`${this.path}/filter-to-date`, params);
  }

  updateBalance(updateData: { customerId: number, paymentType: PaymentType, amountSpent: number }): Observable<void> {
    return this.apiService.post<void, any>(`${this.path}/update-balance`, updateData);
  }
}
