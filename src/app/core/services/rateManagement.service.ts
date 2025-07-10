// services/rate-management.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { ApiService } from './api.service';
import { CustomerService } from './customer.service';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root'
})
export class RateManagementService {
  private voucherPath = 'api/voucher';

  constructor(
    private apiService: ApiService,
    private customerService: CustomerService,
    private itemService: ItemService
  ) { }

  setRate(setRateDto: any): Observable<void> {
    return this.apiService.post<void, any>(`${this.voucherPath}/set-rate`, setRateDto);
  }

  getAllCustomersAndItems(): Observable<{customers: any[], items: any[]}> {
    return forkJoin({
      customers: this.customerService.getCustomers(),
      items: this.itemService.getItems()
    });
  }

  getCustomerItemRateMatrix(): Observable<any[]> {
    return this.getAllCustomersAndItems().pipe(
      map(({ customers, items }) => {
        const matrix: any[] = [];
        customers.forEach(customer => {
          items.forEach(item => {
            matrix.push({
              customerId: customer.id,
              customerName: customer.name,
              itemId: item.id,
              itemName: item.name,
              rate: undefined // Will be populated when rates are fetched
            });
          });
        });
        return matrix;
      })
    );
  }

  getCustomersWithRates(): Observable<any[]> {
    return forkJoin({
      customers: this.customerService.getCustomers(),
      items: this.itemService.getItems()
    }).pipe(
      map(({ customers, items }) => {
        return customers.map(customer => ({
          id: customer.id,
          name: customer.name,
          itemRates: items.map(item => ({
            itemId: item.id,
            itemName: item.name,
            rate: undefined
          }))
        }));
      })
    );
  }

  getItemsWithRates(): Observable<any[]> {
    return forkJoin({
      customers: this.customerService.getCustomers(),
      items: this.itemService.getItems()
    }).pipe(
      map(({ customers, items }) => {
        return items.map(item => ({
          id: item.id,
          name: item.name,
          customerRates: customers.map(customer => ({
            customerId: customer.id,
            customerName: customer.name,
            rate: undefined
          }))
        }));
      })
    );
  }

  // Additional methods for CRUD operations
  createCustomer(customer: any): Observable<any> {
    return this.customerService.createCustomer(customer);
  }

  updateCustomer(id: number, customer: any): Observable<void> {
    return this.customerService.updateCustomer(id, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.customerService.deleteCustomer(id);
  }

  createItem(item: any): Observable<any> {
    return this.itemService.createItem(item);
  }

  updateItem(id: number, item: any): Observable<void> {
    return this.itemService.updateItem(id, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.itemService.deleteItem(id);
  }

  searchCustomers(searchTerm: string): Observable<any[]> {
    return this.customerService.searchCustomers(searchTerm);
  }

  searchItems(searchTerm: string): Observable<any[]> {
    return this.itemService.searchItems(searchTerm);
  }
}
