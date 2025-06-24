import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ExpenseHead, CreateExpenseHead, UpdateExpenseHead } from '../models/expense-head.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseHeadService {
  private path = 'api/expensehead';

  constructor(private apiService: ApiService) { }

  getExpenseHeads(): Observable<ExpenseHead[]> {
    return this.apiService.get<ExpenseHead[]>(this.path);
  }

  getExpenseHead(id: number): Observable<ExpenseHead> {
    return this.apiService.get<ExpenseHead>(`${this.path}/${id}`);
  }

  createExpenseHead(expenseHead: CreateExpenseHead): Observable<ExpenseHead> {
    return this.apiService.post<ExpenseHead, CreateExpenseHead>(this.path, expenseHead);
  }

  updateExpenseHead(id: number, expenseHead: UpdateExpenseHead): Observable<void> {
    return this.apiService.put<void, UpdateExpenseHead>(`${this.path}/${id}`, expenseHead);
  }

  deleteExpenseHead(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.path}/${id}`);
  }
}
