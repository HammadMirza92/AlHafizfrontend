import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { VoucherService } from '../../../core/services/voucher.service';
import { BankService } from '../../../core/services/bank.service';
import { ExpenseHeadService } from '../../../core/services/expense-head.service';
import { VoucherType, PaymentType } from '../../../core/models/enums.model';
import { Bank } from '../../../core/models/bank.model';
import { ExpenseHead } from '../../../core/models/expense-head.model';
import { CreateVoucher, UpdateVoucher } from '../../../core/models/voucher.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

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
    forkJoin([
      this.bankService.getBanks(),
      this.expenseHeadService.getExpenseHeads()
    ]).subscribe(([banks, expenseHeads]) => {
      this.banks = banks;
      this.expenseHeads = expenseHeads;
    });
  }

  loadExpenseVoucher(id: number): void {
    this.voucherService.getVoucher(id).subscribe(voucher => {
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
    }, error => {
      this.showError('Error loading voucher');
      this.router.navigate(['/vouchers/expense']);
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const formValue = this.expenseForm.value;


    if (this.isEditMode && this.voucherId) {
      this.voucherService.updateVoucher(this.voucherId, {
          voucherType: VoucherType.Expense,
          paymentType: formValue.paymentType,
          bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
          paymentDetails: formValue.paymentDetails,
          expenseHeadId: formValue.expenseHeadId,
          amount: formValue.amount,
          details: formValue.details,
          voucherItems: []
        }).subscribe({
        next: () => {
          this.showSuccess('Expense voucher updated successfully');
          this.router.navigate(['/vouchers/expense']);
        },
        error: () => {
          this.showError('Error updating expense voucher');
        }
      });
    } else {
      this.voucherService.createVoucher({
          voucherType: VoucherType.Expense,
          paymentType: formValue.paymentType,
          bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
          paymentDetails: formValue.paymentDetails,
          expenseHeadId: formValue.expenseHeadId,
          amount: formValue.amount,
          details: formValue.details,
          voucherItems: []
        }).subscribe({
        next: () => {
          this.showSuccess('Expense voucher created successfully');
          this.router.navigate(['/vouchers/expense']);
        },
        error: () => {
          this.showError('Error creating expense voucher');
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
