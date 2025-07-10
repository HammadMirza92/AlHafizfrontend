// components/customer-rate-dialog/customer-rate-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RateManagementService } from 'src/app/core/services/rateManagement.service';

interface CustomerDialogData {
  customer?: any;
  items: any[];
}

@Component({
  selector: 'app-customer-rate-dialog',
  template: `
    <h2 mat-dialog-title>{{data.customer ? 'Edit' : 'Add'}} Customer</h2>

    <mat-dialog-content>
      <form [formGroup]="customerForm" class="customer-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Customer Name</mat-label>
          <input matInput
                 formControlName="name"
                 placeholder="Enter customer name">
          <mat-error *ngIf="customerForm.get('name')?.hasError('required')">
            Customer name is required
          </mat-error>
          <mat-error *ngIf="customerForm.get('name')?.hasError('minlength')">
            Customer name must be at least 2 characters
          </mat-error>
          <mat-error *ngIf="customerForm.get('name')?.hasError('maxlength')">
            Customer name cannot exceed 100 characters
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions >
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="onSave()"
              [disabled]="customerForm.invalid || loading">
        <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
        {{data.customer ? 'Update' : 'Create'}} Customer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .customer-form {
      min-width: 350px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 0;
      gap: 8px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    mat-spinner {
      margin: 0;
    }
  `]
})
export class CustomerRateDialogComponent implements OnInit {
  customerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomerRateDialogComponent>,
    private rateManagementService: RateManagementService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: CustomerDialogData
  ) {
    this.customerForm = this.fb.group({
      name: [
        data.customer?.name || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ]
    });
  }

  ngOnInit(): void {
    // Focus on the name input when dialog opens
    setTimeout(() => {
      const nameInput = document.querySelector('input[formControlName="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
    }, 100);
  }

  onSave(): void {
    if (this.customerForm.valid && !this.loading) {
      this.loading = true;
      const customerData = {
        name: this.customerForm.get('name')?.value.trim()
      };

      const operation = this.data.customer
        ? this.rateManagementService.updateCustomer(this.data.customer.id, customerData)
        : this.rateManagementService.createCustomer(customerData);

      operation.subscribe({
        next: (result) => {
          this.loading = false;
          const action = this.data.customer ? 'updated' : 'created';
          this.snackBar.open(`Customer ${action} successfully`, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving customer:', error);
          this.snackBar.open('Error saving customer', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
