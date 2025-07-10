import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CashTransactionService } from '../../../core/services/cash-transaction.service';
import { CashTransaction, CreateCashTransaction } from '../../../core/models/cash-transaction.model';
import { PaymentType } from '../../../core/models/enums.model';
import { BankService } from '../../../core/services/bank.service';
import { Bank } from '../../../core/models/bank.model';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-cash-transaction-form',
  templateUrl: './cash-transaction-form.component.html',
  styleUrls: ['./cash-transaction-form.component.scss']
})
export class CashTransactionFormComponent implements OnInit {
  transactionForm:any;
  isEditMode = false;
  paymentTypes = Object.values(PaymentType);
  banks: Bank[] = [];
  customers: Customer[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CashTransactionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', transaction?: CashTransaction },
    private cashTransactionService: CashTransactionService,
    private bankService: BankService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';
    this.initForm();
    this.loadBanks();
    this.loadCustomers();

    if (this.isEditMode && this.data.transaction) {
      this.patchForm(this.data.transaction);
    }
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      customerId: [null, Validators.required],
      paymentType: [PaymentType.Cash, Validators.required],
      bankId: [null],
      paymentDetails: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      isCashReceived: [false],
      details: ['']
    });

    this.transactionForm.get('paymentType')?.valueChanges.subscribe((value: PaymentType) => {
      const bankIdControl = this.transactionForm.get('bankId');
      if (value === PaymentType.Bank) {
        bankIdControl?.setValidators([Validators.required]);
      } else {
        bankIdControl?.clearValidators();
        bankIdControl?.setValue(null);
      }
      bankIdControl?.updateValueAndValidity();
    });
  }

  patchForm(transaction: CashTransaction): void {
    this.transactionForm.patchValue({
      customerId: transaction.customerId,
      paymentType: transaction.paymentType,
      bankId: transaction.bankId,
      paymentDetails: transaction.paymentDetails,
      amount: transaction.amount,
      isCashReceived: transaction.isCashReceived,
      details: transaction.details
    });
  }

  loadBanks(): void {
    this.bankService.getBanks().subscribe(banks => {
      this.banks = banks;
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
    });
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      return;
    }

    const formValue = this.transactionForm.value;
    const transactionData: CreateCashTransaction = {
      customerId: formValue.customerId,
      paymentType: formValue.paymentType,
      bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : undefined,
      paymentDetails: formValue.paymentDetails,
      amount: formValue.amount,
      isCashReceived: formValue.isCashReceived,
      details: formValue.details
    };

    if (this.isEditMode && this.data.transaction) {
      this.cashTransactionService.updateCashTransaction(this.data.transaction.id, transactionData)
        .subscribe(() => {
          this.dialogRef.close(true);
        });
    } else {
      this.cashTransactionService.createCashTransaction(transactionData)
        .subscribe(() => {
          this.dialogRef.close(true);
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
