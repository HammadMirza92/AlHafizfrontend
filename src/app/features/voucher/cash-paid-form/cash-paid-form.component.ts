import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { BankService } from '../../../core/services/bank.service';
import { CashTransactionService } from '../../../core/services/cash-transaction.service';
import { Customer } from '../../../core/models/customer.model';
import { Bank } from '../../../core/models/bank.model';
import { PaymentType } from '../../../core/models/enums.model';
import { CreateCashTransaction } from '../../../core/models/cash-transaction.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-cash-paid-form',
  templateUrl: './cash-paid-form.component.html',
  styleUrls: ['./cash-paid-form.component.scss']
})
export class CashPaidFormComponent implements OnInit {
  cashPaidForm: FormGroup;
  isEditMode = false;
  transactionId: number | null = null;
  customers: Customer[] = [];
  banks: Bank[] = [];
  paymentTypes = PaymentType;

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private bankService: BankService,
    private cashTransactionService: CashTransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cashPaidForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDependentData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transactionId = +id;
      this.loadCashTransaction(this.transactionId);
    }
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
    forkJoin([
      this.customerService.getCustomers(),
      this.bankService.getBanks()
    ]).subscribe(([customers, banks]) => {
      this.customers = customers;
      this.banks = banks;
    });
  }

  loadCashTransaction(id: number): void {
    this.cashTransactionService.getCashTransaction(id).subscribe(transaction => {
      if (transaction && !transaction.isCashReceived) {
        // Update form with transaction data
        this.cashPaidForm.patchValue({
          customerId: transaction.customerId,
          paymentType: transaction.paymentType,
          bankId: transaction.bankId,
          paymentDetails: transaction.paymentDetails,
          amount: transaction.amount,
          details: transaction.details
        });
      } else {
        this.showError('Transaction not found or is not a Cash Paid transaction');
        this.router.navigate(['/vouchers/cash-paid']);
      }
    }, error => {
      this.showError('Error loading transaction');
      this.router.navigate(['/vouchers/cash-paid']);
    });
  }

  onSubmit(): void {
    if (this.cashPaidForm.invalid) {
      this.cashPaidForm.markAllAsTouched();
      return;
    }

    const formValue = this.cashPaidForm.value;

    const transactionData: CreateCashTransaction = {
      customerId: formValue.customerId,
      paymentType: formValue.paymentType,
      bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
      paymentDetails: formValue.paymentDetails,
      amount: formValue.amount,
      isCashReceived: false,
      details: formValue.details
    };

    if (this.isEditMode && this.transactionId) {
      this.cashTransactionService.updateCashTransaction(this.transactionId, transactionData).subscribe({
        next: () => {
          this.showSuccess('Cash paid transaction updated successfully');
          this.router.navigate(['/vouchers/cash-paid']);
        },
        error: () => {
          this.showError('Error updating cash paid transaction');
        }
      });
    } else {
      this.cashTransactionService.createCashTransaction(transactionData).subscribe({
        next: () => {
          this.showSuccess('Cash paid transaction created successfully');
          this.router.navigate(['/vouchers/cash-paid']);
        },
        error: () => {
          this.showError('Error creating cash paid transaction');
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
