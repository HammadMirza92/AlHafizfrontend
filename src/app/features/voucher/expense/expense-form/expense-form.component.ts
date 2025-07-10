import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { VoucherService } from '../../../../core/services/voucher.service';
import { BankService } from '../../../../core/services/bank.service';
import { ExpenseHeadService } from '../../../../core/services/expense-head.service';
import { Bank } from '../../../../core/models/bank.model';
import { ExpenseHead } from '../../../../core/models/expense-head.model';
import { VoucherType, PaymentType } from '../../../../core/models/enums.model';
import { CreateVoucher } from '../../../../core/models/voucher.model';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isEditMode = false;
  voucherId: number | null = null;
  banks: Bank[] = [];
  expenseHeads: ExpenseHead[] = [];
  paymentTypes = PaymentType;
  loading = false;
  submitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private voucherService: VoucherService,
    private bankService: BankService,
    private expenseHeadService: ExpenseHeadService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.expenseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDependentData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.voucherId = +id;
      this.loadExpenseVoucher(this.voucherId);
    }

    // Set up form control value changes
    this.expenseForm.get('paymentType')?.valueChanges.subscribe(value => {
      const bankIdControl = this.expenseForm.get('bankId');

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
      paymentType: [PaymentType.Cash, Validators.required],
      bankId: [null],
      paymentDetails: [''],
      expenseHeadId: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      details: ['']
    });
  }

  loadDependentData(): void {
    this.loading = true;

    forkJoin({
      banks: this.bankService.getBanks(),
      expenseHeads: this.expenseHeadService.getExpenseHeads()
    }).subscribe({
      next: (results) => {
        this.banks = results.banks;
        this.expenseHeads = results.expenseHeads;
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

  loadExpenseVoucher(id: number): void {
    this.loading = true;

    this.voucherService.getVoucher(id).subscribe({
      next: (voucher) => {
        if (voucher && voucher.voucherType === VoucherType.Expense) {
          // Update form with voucher data
          this.expenseForm.patchValue({
            paymentType: voucher.paymentType,
            bankId: voucher.bankId,
            paymentDetails: voucher.paymentDetails,
            expenseHeadId: voucher.expenseHeadId,
            amount: voucher.amount,
            details: voucher.details
          });
        } else {
          this.showError('Voucher not found or is not an Expense voucher');
          this.router.navigate(['/vouchers/expense']);
        }
      },
      error: (error) => {
        this.showError('Error loading voucher');
        console.error(error);
        this.router.navigate(['/vouchers/expense']);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.expenseForm.value;

    const voucherData: CreateVoucher = {
      voucherType: VoucherType.Expense,
      paymentType: formValue.paymentType,
      bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
      paymentDetails: formValue.paymentDetails,
      expenseHeadId: formValue.expenseHeadId,
      amount: formValue.amount,
      details: formValue.details,
      voucherItems: []
    };

    if (this.isEditMode && this.voucherId) {
      this.voucherService.updateVoucher(this.voucherId, voucherData).subscribe({
        next: () => {
          this.showSuccess('Expense voucher updated successfully');
          this.router.navigate(['/vouchers/expense']);
        },
        error: (error) => {
          this.showError('Error updating expense voucher');
          console.error(error);
          this.submitting = false;
        }
      });
    } else {
      this.voucherService.createVoucher(voucherData).subscribe({
        next: () => {
          this.showSuccess('Expense voucher created successfully');
          this.router.navigate(['/vouchers/expense']);
        },
        error: (error) => {
          this.showError('Error creating expense voucher');
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
