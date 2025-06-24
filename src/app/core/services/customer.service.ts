import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Customer, CreateCustomer, UpdateCustomer } from '../models/customer.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private path = 'api/customer';

  constructor(private apiService: ApiService) { }

  getCustomers(): Observable<Customer[]> {
    return this.apiService.get<Customer[]>(this.path);
  }

  getCustomer(id: number): Observable<Customer> {
    return this.apiService.get<Customer>(`${this.path}/${id}`);
  }

  createCustomer(customer: CreateCustomer): Observable<Customer> {
    return this.apiService.post<Customer, CreateCustomer>(this.path, customer);
  }

  updateCustomer(id: number, customer: UpdateCustomer): Observable<void> {
    return this.apiService.put<void, UpdateCustomer>(`${this.path}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.path}/${id}`);
  }

  searchCustomers(searchTerm: string): Observable<Customer[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.apiService.get<Customer[]>(`${this.path}/search`, params);
  }
}
