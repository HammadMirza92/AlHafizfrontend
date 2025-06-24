import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Stock } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private path = 'api/stock';

  constructor(private apiService: ApiService) { }

  getStocks(): Observable<Stock[]> {
    return this.apiService.get<Stock[]>(this.path);
  }

  getStockByItemId(itemId: number): Observable<Stock> {
    return this.apiService.get<Stock>(`${this.path}/item/${itemId}`);
  }
}
