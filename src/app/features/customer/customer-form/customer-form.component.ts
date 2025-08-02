import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../../core/services/customer.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  customerId: number | null = null;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.customerForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.customerId = +id;
      this.loadCustomer(this.customerId);
    }
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.pattern('^[0-9+\\-\\s()]*$')],
      description: ['']
    });
  }

  loadCustomer(id: number): void {
    this.isLoading = true;
    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          name: customer.name,
          phoneNumber: customer.phoneNumber,
          description: customer.description
        });
        this.isLoading = false;
      },
      error: () => {
        this.showError('Customer not found');
        this.router.navigate(['/customers']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      return;
    }

    const formValue = this.customerForm.value;
    const customerData = {
      name: formValue.name,
      phoneNumber: formValue.phoneNumber || '',
      description: formValue.description || ''
    };

    this.isLoading = true;

    if (this.isEditMode && this.customerId) {
      this.customerService.updateCustomer(this.customerId, customerData).subscribe({
        next: () => {
          this.showSuccess('Customer updated successfully');
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          this.showError('Error updating customer: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    } else {
      this.customerService.createCustomer(customerData).subscribe({
        next: () => {
          this.showSuccess('Customer created successfully');
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          this.showError('Error creating customer: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    }
  }

  showSuccess(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'success' },
      duration: 3000
    });
  }

  showError(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'error' },
      duration: 5000
    });
  }

  getErrorMessage(error: any): string {
    return error.error?.message || error.message || 'Unknown error occurred';
  }
}
