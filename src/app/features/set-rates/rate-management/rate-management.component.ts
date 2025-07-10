// components/rate-management/rate-management.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';
import { RateManagementService } from 'src/app/core/services/rateManagement.service';
import { SetRateDialogComponent } from '../set-rate-dialog/set-rate-dialog.component';
import { CustomerRateDialogComponent } from '../customer-rate-dialog/customer-rate-dialog.component';
import { ItemRateDialogComponent } from '../item-rate-dialog/item-rate-dialog.component';

@Component({
  selector: 'app-rate-management',
  templateUrl: './rate-management.component.html',
  styleUrls: ['./rate-management.component.scss']
})
export class RateManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data sources
  customerDataSource = new MatTableDataSource<any>([]);
  itemDataSource = new MatTableDataSource<any>([]);
  rateMatrixDataSource = new MatTableDataSource<any>([]);

  // Table columns
  customerColumns = ['id', 'name', 'actions'];
  itemColumns = ['id', 'name', 'actions'];
  rateMatrixColumns = ['customerName', 'itemName', 'rate', 'actions'];

  // View mode
  viewMode: 'customers' | 'items' | 'rates' = 'rates';

  // Loading states
  loading = false;

  // Search controls
  customerSearchControl = new FormControl('');
  itemSearchControl = new FormControl('');
  rateSearchControl = new FormControl('');

  // Data
  customers: any[] = [];
  items: any[] = [];
  rateMatrix: any[] = [];

  constructor(
    private rateManagementService: RateManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupSearch();
  }

  loadData(): void {
    this.loading = true;
    this.rateManagementService.getAllCustomersAndItems().subscribe({
      next: ({ customers, items }) => {
        this.customers = customers;
        this.items = items;
        this.customerDataSource.data = customers;
        this.itemDataSource.data = items;
        this.generateRateMatrix();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  generateRateMatrix(): void {
    this.rateMatrix = [];
    this.customers.forEach(customer => {
      this.items.forEach(item => {
        this.rateMatrix.push({
          customerId: customer.id,
          customerName: customer.name,
          itemId: item.id,
          itemName: item.name,
          rate: undefined
        });
      });
    });
    this.rateMatrixDataSource.data = this.rateMatrix;
  }

  setupSearch(): void {
    // Customer search
    this.customerSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(searchTerm => {
        this.applyCustomerFilter(searchTerm || '');
      });

    // Item search
    this.itemSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(searchTerm => {
        this.applyItemFilter(searchTerm || '');
      });

    // Rate matrix search
    this.rateSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(searchTerm => {
        this.applyRateFilter(searchTerm || '');
      });
  }

  applyCustomerFilter(filterValue: string): void {
    this.customerDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyItemFilter(filterValue: string): void {
    this.itemDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyRateFilter(filterValue: string): void {
    this.rateMatrixDataSource.filter = filterValue.trim().toLowerCase();
  }

  // Customer operations
  openCustomerDialog(customer?: any): void {
    const dialogRef = this.dialog.open(CustomerRateDialogComponent, {
      width: '400px',
      data: { customer, items: this.items }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteCustomer(customer: any): void {
    if (confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      this.rateManagementService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.snackBar.open('Customer deleted successfully', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          this.snackBar.open('Error deleting customer', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Item operations
  openItemDialog(item?: any): void {
    const dialogRef = this.dialog.open(ItemRateDialogComponent, {
      width: '400px',
      data: { item, customers: this.customers }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteItem(item: any): void {
    if (confirm(`Are you sure you want to delete item "${item.name}"?`)) {
      this.rateManagementService.deleteItem(item.id).subscribe({
        next: () => {
          this.snackBar.open('Item deleted successfully', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.snackBar.open('Error deleting item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Rate operations
  setRate(customerItemRate: any): void {
    const dialogRef = this.dialog.open(SetRateDialogComponent, {
      width: '400px',
      data: customerItemRate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rateManagementService.setRate({
          customerId: customerItemRate.customerId,
          itemId: customerItemRate.itemId,
          rate: result
        }).subscribe({
          next: () => {
            this.snackBar.open('Rate set successfully', 'Close', { duration: 3000 });
            // Update the rate in the matrix
            const index = this.rateMatrix.findIndex(r =>
              r.customerId === customerItemRate.customerId &&
              r.itemId === customerItemRate.itemId
            );
            if (index !== -1) {
              this.rateMatrix[index].rate = result;
              this.rateMatrixDataSource.data = [...this.rateMatrix];
            }
          },
          error: (error) => {
            console.error('Error setting rate:', error);
            this.snackBar.open('Error setting rate', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  changeView(mode: 'customers' | 'items' | 'rates'): void {
    this.viewMode = mode;
  }

  ngAfterViewInit(): void {
    this.customerDataSource.paginator = this.paginator;
    this.customerDataSource.sort = this.sort;
    this.itemDataSource.paginator = this.paginator;
    this.itemDataSource.sort = this.sort;
    this.rateMatrixDataSource.paginator = this.paginator;
    this.rateMatrixDataSource.sort = this.sort;
  }
}
