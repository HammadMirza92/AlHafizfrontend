import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Bank, CreateBank, UpdateBank } from '../models/bank.model';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private path = 'api/bank';

  constructor(private apiService: ApiService) { }

  getBanks(): Observable<Bank[]> {
    return this.apiService.get<Bank[]>(this.path);
  }

  getBank(id: number): Observable<Bank> {
    return this.apiService.get<Bank>(`${this.path}/${id}`);
  }

  createBank(bank: CreateBank): Observable<Bank> {
    return this.apiService.post<Bank, CreateBank>(this.path, bank);
  }

  updateBank(id: number, bank: UpdateBank): Observable<void> {
    return this.apiService.put<void, UpdateBank>(`${this.path}/${id}`, bank);
  }

  deleteBank(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.path}/${id}`);
  }
}
