// rate-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, forkJoin, Subject } from 'rxjs';
import { CustomerItemRateService } from 'src/app/core/services/customer-item-rate.service';
import { CustomerService } from 'src/app/core/services/customer.service';
import { ItemService } from 'src/app/core/services/item.service';
import { AlertComponent } from 'src/app/shared/components/alert/alert.component';

@Component({
  selector: 'app-rate-management',
  templateUrl: './rate-management.component.html',
  styleUrls: ['./rate-management.component.scss']
})
export class RateManagementComponent implements OnInit {
  customers: any[] = [];
  items: any[] = [];
  rates: any[] = [];
  loading = false;
  filteredCustomers: any[] = [];
  rateForm: FormGroup;
  selectedCustomerId: number | null = null;
  customerRates: any[] = [];
customerSearchText: string = '';
  // Table columns
  displayedColumns: string[] = ['itemName', 'rate', 'actions'];
private searchSubject = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private rateService: CustomerItemRateService,
    private customerService: CustomerService,
    private itemService: ItemService,
    private snackBar: MatSnackBar
  ) {
    this.rateForm = this.createRateForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe(searchText => {
    this.filterCustomers(searchText);
  });
  }
onSearchInput(searchText: string): void {
  this.searchSubject.next(searchText);
}
  createRateForm(): FormGroup {
    return this.formBuilder.group({
      customerId: [null, Validators.required],
      itemId: [null, Validators.required],
      rate: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  loadData(): void {
    this.loading = true;

    forkJoin([
      this.customerService.getCustomers(),
      this.itemService.getItems(),
      this.rateService.getAllRates()
    ]).subscribe({
      next: ([customers, items, rates]) => {
        this.customers = customers;
        this.filteredCustomers = [...customers];
        this.items = items;
        this.rates = rates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.showSnackBar('Error loading rate data', 'error');
        this.loading = false;
      }
    });
  }
  filterCustomers(searchText: string): void {
      this.customerSearchText = searchText.toLowerCase();
      if (!this.customerSearchText) {
        this.filteredCustomers = [...this.customers];
        return;
      }

      this.filteredCustomers = this.customers.filter(customer =>
        customer.name.toLowerCase().includes(this.customerSearchText)
      );
    }
  onCustomerChange(customerId: number): void {
    this.selectedCustomerId = customerId;
    this.rateForm.patchValue({ customerId });

    this.loading = true;
    this.rateService.getRatesByCustomer(customerId).subscribe({
      next: (rates) => {
        this.customerRates = rates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer rates:', error);
        this.showSnackBar('Error loading customer rates', 'error');
        this.loading = false;
      }
    });
  }

  editRate(rate: any): void {
    this.rateForm.patchValue({
      customerId: rate.customerId,
      itemId: rate.itemId,
      rate: rate.rate
    });
  }

  setRate(): void {
    if (this.rateForm.invalid) {
      this.rateForm.markAllAsTouched();
      return;
    }

    const formValue = this.rateForm.value;
    this.loading = true;

    this.rateService.setRate({
      customerId: formValue.customerId,
      itemId: formValue.itemId,
      rate: formValue.rate
    }).subscribe({
      next: () => {
        this.showSnackBar('Rate updated successfully', 'success');
        if (this.selectedCustomerId) {
          this.onCustomerChange(this.selectedCustomerId);
        }
        this.rateForm.patchValue({
          itemId: null,
          rate: 0
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error setting rate:', error);
        this.showSnackBar('Error updating rate', 'error');
        this.loading = false;
      }
    });
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // Helper methods to avoid template binding issues
  isCustomerSelected(customerId: number): boolean {
    return this.selectedCustomerId === customerId;
  }

  getSelectedCustomerName(): string {
    if (!this.selectedCustomerId || !this.customers) return '';
    const customer = this.customers.find(c => c.id === this.selectedCustomerId);
    return customer ? customer.name : '';
  }
}
