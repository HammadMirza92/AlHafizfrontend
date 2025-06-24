import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VoucherService } from '../../../core/services/voucher.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ExpenseHeadService } from '../../../core/services/expense-head.service';
import { Voucher } from '../../../core/models/voucher.model';
import { Customer } from '../../../core/models/customer.model';
import { ExpenseHead } from '../../../core/models/expense-head.model';
import { VoucherType, PaymentType } from '../../../core/models/enums.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-voucher-list',
  templateUrl: './voucher-list.component.html',
  styleUrls: ['./voucher-list.component.scss']
})
export class VoucherListComponent implements OnInit {
  voucherType: VoucherType;
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<Voucher>([]);
  customers: Customer[] = [];
  expenseHeads: ExpenseHead[] = [];
  filterForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private expenseHeadService: ExpenseHeadService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.voucherType = this.route.snapshot.data['voucherType'] || 0;

    this.filterForm = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
      customerId: [null],
      expenseHeadId: [null]
    });

    this.setDisplayedColumns();
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
    const requests = [];

    if (this.voucherType === VoucherType.Purchase ||
        this.voucherType === VoucherType.Sale ||
        this.voucherType === VoucherType.CashPaid ||
        this.voucherType === VoucherType.CashReceived) {
      requests.push(this.customerService.getCustomers());
    }

    if (this.voucherType === VoucherType.Expense || this.voucherType === VoucherType.Hazri) {
      requests.push(this.expenseHeadService.getExpenseHeads());
    }

    if (requests.length > 0) {
      forkJoin(requests).subscribe(results => {
        if (this.voucherType === VoucherType.Purchase ||
            this.voucherType === VoucherType.Sale ||
            this.voucherType === VoucherType.CashPaid ||
            this.voucherType === VoucherType.CashReceived) {
          this.customers = results[0] as Customer[];
        }

        if (this.voucherType === VoucherType.Expense || this.voucherType === VoucherType.Hazri) {
          this.expenseHeads = results[0] as ExpenseHead[];
        }
      });
    }
  }

  loadVouchers(): void {
    const filter = {
      voucherType: this.voucherType === 1 ? undefined : this.voucherType,
      fromDate: this.filterForm.value.fromDate,
      toDate: this.filterForm.value.toDate,
      customerId: this.filterForm.value.customerId,
      expenseHeadId: this.filterForm.value.expenseHeadId
    };

    this.voucherService.filterVouchers(filter).subscribe(vouchers => {
      this.dataSource.data = vouchers;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  setDisplayedColumns(): void {
    const baseColumns = ['id', 'date'];
    const endColumns = ['paymentType', 'bank', 'amount', 'details', 'edit', 'delete'];

    if (this.voucherType === VoucherType.Purchase ||
        this.voucherType === VoucherType.Sale ||
        this.voucherType === VoucherType.CashPaid ||
        this.voucherType === VoucherType.CashReceived) {
      this.displayedColumns = [...baseColumns, 'customer', ...endColumns];
    } else if (this.voucherType === VoucherType.Expense || this.voucherType === VoucherType.Hazri) {
      this.displayedColumns = [...baseColumns, 'expenseHead', ...endColumns];
    } else {
      this.displayedColumns = [...baseColumns, ...endColumns];
    }
  }

  getVoucherTypeTitle(): string {
    switch (this.voucherType) {
      case VoucherType.Purchase:
        return 'Purchase';
      case VoucherType.Sale:
        return 'Sale';
      case VoucherType.Expense:
        return 'Expense';
      case VoucherType.Hazri:
        return 'Hazri';
      case VoucherType.CashPaid:
        return 'Cash Paid';
      case VoucherType.CashReceived:
        return 'Cash Received';
      default:
        return 'All';
    }
  }

  getNewVoucherPath(): string {
    switch (this.voucherType) {
      case VoucherType.Purchase:
        return '/vouchers/purchase/new';
      case VoucherType.Sale:
        return '/vouchers/sale/new';
      case VoucherType.Expense:
        return '/vouchers/expense/new';
      case VoucherType.Hazri:
        return '/vouchers/hazri/new';
      case VoucherType.CashPaid:
        return '/vouchers/cash-paid/new';
      case VoucherType.CashReceived:
        return '/vouchers/cash-received/new';
      default:
        return '';
    }
  }

  getPaymentTypeText(paymentType: PaymentType): string {
    debugger;
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
        message: `Are you sure you want to delete ${this.getVoucherTypeTitle()} Voucher #${voucher.id}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voucherService.deleteVoucher(voucher.id).subscribe({
          next: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: `${this.getVoucherTypeTitle()} Voucher deleted successfully!`,
                type: 'success'
              },
              duration: 3000
            });
            this.loadVouchers();
          },
          error: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Error deleting voucher. Please try again.',
                type: 'error'
              },
              duration: 3000
            });
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
}
