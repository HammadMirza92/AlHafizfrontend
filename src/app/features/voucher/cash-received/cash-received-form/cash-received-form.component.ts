import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { CustomerService } from '../../../../core/services/customer.service';
import { BankService } from '../../../../core/services/bank.service';
import { CashTransactionService } from '../../../../core/services/cash-transaction.service';
import { Customer } from '../../../../core/models/customer.model';
import { Bank } from '../../../../core/models/bank.model';
import { PaymentType } from '../../../../core/models/enums.model';
import { CreateCashTransaction } from '../../../../core/models/cash-transaction.model';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-cash-received-form',
  templateUrl: './cash-received-form.component.html',
  styleUrls: ['./cash-received-form.component.scss']
})
export class CashReceivedFormComponent implements OnInit {
  cashReceivedForm: FormGroup;
  isEditMode = false;
  transactionId: number | null = null;
  customers: Customer[] = [];
  banks: Bank[] = [];
  paymentTypes = PaymentType;
  loading = false;
  submitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private bankService: BankService,
    private cashTransactionService: CashTransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cashReceivedForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDependentData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transactionId = +id;
      this.loadCashTransaction(this.transactionId);
    }

    // Set up form control value changes
    this.cashReceivedForm.get('paymentType')?.valueChanges.subscribe(value => {
      const bankIdControl = this.cashReceivedForm.get('bankId');

      if (value === PaymentType.Bank) {
        bankIdControl?.setValidators([Validators.required]);
      } else {
        bankIdControl?.clearValidators();
        bankIdControl?.setValue(null);
      }

      bankIdControl?.updateValueAndValidity();
    });
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      customerId: [null, Validators.required],
      paymentType: [PaymentType.Cash, Validators.required],
      bankId: [null],
      paymentDetails: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      details: ['']
    });
  }

  loadDependentData(): void {
    this.loading = true;

    forkJoin({
      customers: this.customerService.getCustomers(),
      banks: this.bankService.getBanks()
    }).subscribe({
      next: (results) => {
        this.customers = results.customers;
        this.banks = results.banks;
      },
      error: (error) => {
        this.showError('Error loading data');
        console.error(error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  loadCashTransaction(id: number): void {
    this.loading = true;

    this.cashTransactionService.getCashTransaction(id).subscribe({
      next: (transaction) => {
        if (transaction && transaction.isCashReceived) {
          // Update form with transaction data
          this.cashReceivedForm.patchValue({
            customerId: transaction.customerId,
            paymentType: transaction.paymentType,
            bankId: transaction.bankId,
            paymentDetails: transaction.paymentDetails,
            amount: transaction.amount,
            details: transaction.details
          });
        } else {
          this.showError('Transaction not found or is not a Cash Received transaction');
          this.router.navigate(['/vouchers/cash-received']);
        }
      },
      error: (error) => {
        this.showError('Error loading transaction');
        console.error(error);
        this.router.navigate(['/vouchers/cash-received']);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.cashReceivedForm.invalid) {
      this.cashReceivedForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.cashReceivedForm.value;

    const transactionData: CreateCashTransaction = {
      customerId: formValue.customerId,
      paymentType: formValue.paymentType,
      bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
      paymentDetails: formValue.paymentDetails,
      amount: formValue.amount,
      isCashReceived: true, // This is a Cash Received transaction
      details: formValue.details
    };

    if (this.isEditMode && this.transactionId) {
      this.cashTransactionService.updateCashTransaction(this.transactionId, transactionData).subscribe({
        next: () => {
          this.showSuccess('Cash received transaction updated successfully');
          this.router.navigate(['/vouchers/cash-received']);
        },
        error: (error) => {
          this.showError('Error updating cash received transaction');
          console.error(error);
          this.submitting = false;
        }
      });
    } else {
      this.cashTransactionService.createCashTransaction(transactionData).subscribe({
        next: () => {
          this.showSuccess('Cash received transaction created successfully');
          this.router.navigate(['/vouchers/cash-received']);
        },
        error: (error) => {
          this.showError('Error creating cash received transaction');
          console.error(error);
          this.submitting = false;
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
      duration: 3000
    });
  }
}
