import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Item, CreateItem, UpdateItem } from '../models/item.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private path = 'api/item';

  constructor(private apiService: ApiService) { }

  getItems(): Observable<Item[]> {
    return this.apiService.get<Item[]>(this.path);
  }

  getItem(id: number): Observable<Item> {
    return this.apiService.get<Item>(`${this.path}/${id}`);
  }

  createItem(item: CreateItem): Observable<Item> {
    return this.apiService.post<Item, CreateItem>(this.path, item);
  }

  updateItem(id: number, item: UpdateItem): Observable<void> {
    return this.apiService.put<void, UpdateItem>(`${this.path}/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.path}/${id}`);
  }

  searchItems(searchTerm: string): Observable<Item[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.apiService.get<Item[]>(`${this.path}/search`, params);
  }
}
