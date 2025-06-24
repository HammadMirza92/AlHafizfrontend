import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CashTransaction, CreateCashTransaction, CashTransactionFilter } from '../models/cash-transaction.model';
import { HttpParams } from '@angular/common/http';

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

    if (filter.isCashReceived !== undefined) {
      params = params.set('isCashReceived', filter.isCashReceived.toString());
    }

    return this.apiService.get<CashTransaction[]>(`${this.path}/filter`, params);
  }
}
