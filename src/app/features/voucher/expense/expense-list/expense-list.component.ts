import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { VoucherService } from '../../../../core/services/voucher.service';
import { ExpenseHeadService } from '../../../../core/services/expense-head.service';
import { BankService } from '../../../../core/services/bank.service';
import { Voucher, VoucherFilter } from '../../../../core/models/voucher.model';
import { ExpenseHead } from '../../../../core/models/expense-head.model';
import { Bank } from '../../../../core/models/bank.model';
import { VoucherType, PaymentType } from '../../../../core/models/enums.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'date', 'expenseHead', 'paymentType', 'bank', 'amount', 'details', 'edit', 'delete'];
  dataSource = new MatTableDataSource<Voucher>([]);
  expenseHeads: ExpenseHead[] = [];
  banks: Bank[] = [];
  filterForm: FormGroup;
  paymentTypes = PaymentType;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private voucherService: VoucherService,
    private expenseHeadService: ExpenseHeadService,
    private bankService: BankService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
      expenseHeadId: [null],
      paymentType: [null]
    });
  }

  ngOnInit(): void {
    this.loadDependentData();
    this.loadVouchers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDependentData(): void {
    this.loading = true;

    // Load expense heads and banks
    this.expenseHeadService.getExpenseHeads().subscribe({
      next: (expenseHeads) => {
        this.expenseHeads = expenseHeads;
      },
      error: (error) => {
        this.showError('Error loading expense heads');
        console.error(error);
      }
    });

    this.bankService.getBanks().subscribe({
      next: (banks) => {
        this.banks = banks;
      },
      error: (error) => {
        this.showError('Error loading banks');
        console.error(error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  loadVouchers(): void {
    this.loading = true;

    const filter: VoucherFilter = {
      voucherType: VoucherType.Expense,
      fromDate: this.filterForm.value.fromDate,
      toDate: this.filterForm.value.toDate,
      expenseHeadId: this.filterForm.value.expenseHeadId
    };

    this.voucherService.filterVouchers(filter).subscribe({
      next: (vouchers) => {
        this.dataSource.data = vouchers;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      },
      error: (error) => {
        this.showError('Error loading vouchers');
        console.error(error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getPaymentTypeText(paymentType: PaymentType): string {
    switch (paymentType) {
      case PaymentType.Cash:
        return 'Cash';
      case PaymentType.Bank:
        return 'Bank';
      case PaymentType.Credit:
        return 'Credit';
      default:
        return '';
    }
  }

  deleteVoucher(voucher: Voucher): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete Expense Voucher #${voucher.id}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.voucherService.deleteVoucher(voucher.id).subscribe({
          next: () => {
            this.showSuccess('Expense Voucher deleted successfully!');
            this.loadVouchers(); // Reload the list after deletion
          },
          error: (error) => {
            this.showError('Error deleting Expense Voucher. Please try again.');
            console.error(error);
            this.loading = false;
          }
        });
      }
    });
  }

  onFilter(): void {
    this.loadVouchers();
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.loadVouchers();
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
