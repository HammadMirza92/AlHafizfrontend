import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'phoneNumber', 'description', 'actions'];
  dataSource = new MatTableDataSource<Customer>([]);
  searchTerm = '';
  isLoading = false;
  allCustomers: Customer[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.allCustomers = customers;
        this.dataSource.data = customers;
        this.isLoading = false;
      },
      error: (error) => {
        this.showError('Error loading customers: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    // Front-end filtering
    const filterValue = this.searchTerm.toLowerCase().trim();

    if (!filterValue) {
      this.dataSource.data = this.allCustomers;
      return;
    }

    this.dataSource.data = this.allCustomers.filter(customer => {
      const nameMatch = customer.name?.toLowerCase().includes(filterValue) || false;
      const phoneMatch = customer.phoneNumber?.toLowerCase().includes(filterValue) || false;
      const descMatch = customer.description?.toLowerCase().includes(filterValue) || false;

      return nameMatch || phoneMatch || descMatch;
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.dataSource.data = this.allCustomers;
  }

  deleteCustomer(customer: Customer): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete customer "${customer.name}"?`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.showSuccess(`Customer "${customer.name}" deleted successfully!`);
            this.loadCustomers();
          },
          error: (error) => {
            this.showError('Error deleting customer: ' + this.getErrorMessage(error));
            this.isLoading = false;
          }
        });
      }
    });
  }

  showSuccess(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message,
        type: 'success'
      },
      duration: 3000
    });
  }

  showError(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message,
        type: 'error'
      },
      duration: 5000
    });
  }

  getErrorMessage(error: any): string {
    return error.error?.message || error.message || 'Unknown error occurred';
  }
}
