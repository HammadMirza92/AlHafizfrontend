import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { CashTransactionService } from '../../../../core/services/cash-transaction.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { BankService } from '../../../../core/services/bank.service';
import { CashTransaction, CashTransactionFilter } from '../../../../core/models/cash-transaction.model';
import { Customer } from '../../../../core/models/customer.model';
import { Bank } from '../../../../core/models/bank.model';
import { PaymentType } from '../../../../core/models/enums.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-cash-received-list',
  templateUrl: './cash-received-list.component.html',
  styleUrls: ['./cash-received-list.component.scss']
})
export class CashReceivedListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'date', 'customer', 'paymentType', 'bank', 'amount', 'details', 'edit', 'delete'];
  dataSource = new MatTableDataSource<CashTransaction>([]);
  customers: Customer[] = [];
  banks: Bank[] = [];
  filterForm: FormGroup;
  paymentTypes = PaymentType;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private cashTransactionService: CashTransactionService,
    private customerService: CustomerService,
    private bankService: BankService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
      customerId: [null],
      paymentType: [null]
    });
  }

  ngOnInit(): void {
    this.loadDependentData();
    this.loadTransactions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDependentData(): void {
    this.loading = true;

    // Load customers and banks
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        this.showError('Error loading customers');
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

  loadTransactions(): void {
    this.loading = true;

    const filter: CashTransactionFilter = {
      isCashReceived: true, // This is a Cash Received transaction
      fromDate: this.filterForm.value.fromDate,
      toDate: this.filterForm.value.toDate,
      customerId: this.filterForm.value.customerId,
      paymentType: this.filterForm.value.paymentType
    };

    this.cashTransactionService.filterCashTransactions(filter).subscribe({
      next: (transactions) => {
        this.dataSource.data = transactions;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      },
      error: (error) => {
        this.showError('Error loading transactions');
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

  deleteTransaction(transaction: CashTransaction): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete Cash Received Voucher #${transaction.id}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.cashTransactionService.deleteCashTransaction(transaction.id).subscribe({
          next: () => {
            this.showSuccess('Cash Received Voucher deleted successfully!');
            this.loadTransactions(); // Reload the list after deletion
          },
          error: (error) => {
            this.showError('Error deleting Cash Received Voucher. Please try again.');
            console.error(error);
            this.loading = false;
          }
        });
      }
    });
  }

  onFilter(): void {
    this.loadTransactions();
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.loadTransactions();
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
