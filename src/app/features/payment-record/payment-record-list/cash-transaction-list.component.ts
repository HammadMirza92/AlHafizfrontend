import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { CashTransactionService } from '../../../core/services/cash-transaction.service';
import { CashTransaction } from '../../../core/models/cash-transaction.model';
import { CashTransactionFilter } from '../../../core/models/cash-transaction.model';
import { CashTransactionFormComponent } from '../cash-transaction-form/cash-transaction-form.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaymentType } from '../../../core/models/enums.model';

@Component({
  selector: 'app-cash-transaction-list',
  templateUrl: './cash-transaction-list.component.html',
  styleUrls: ['./cash-transaction-list.component.scss']
})
export class CashTransactionListComponent implements OnInit {
  displayedColumns: string[] = ['customerName', 'paymentType', 'amount', 'paymentDetails', 'isCashReceived', 'createdAt', 'actions'];
  dataSource: any;
  loading = false;

  @ViewChild(MatPaginator) paginator:any;
  @ViewChild(MatSort) sort: any;

  constructor(
    private cashTransactionService: CashTransactionService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(filter?: CashTransactionFilter): void {
    this.loading = true;
    debugger;
    this.cashTransactionService.filterCashTransactions(filter || {})
      .subscribe({
        next: (transactions) => {
          debugger;
          this.dataSource = new MatTableDataSource(transactions);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onFilterChanged(filter: CashTransactionFilter): void {
    this.loadTransactions(filter);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CashTransactionFormComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTransactions();
      }
    });
  }

  openEditDialog(transaction: CashTransaction): void {
    const dialogRef = this.dialog.open(CashTransactionFormComponent, {
      width: '600px',
      data: { mode: 'edit', transaction }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTransactions();
      }
    });
  }

  deleteTransaction(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this transaction?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cashTransactionService.deleteCashTransaction(id)
          .subscribe(() => {
            this.loadTransactions();
          });
      }
    });
  }

  getPaymentTypeDisplay(type: any): string {
    switch (type) {
      case PaymentType.Cash: return 'Cash';
      case PaymentType.Bank: return 'Bank';
      case PaymentType.Credit: return 'Credit';
      default: return type.toString();
    }
  }
}
