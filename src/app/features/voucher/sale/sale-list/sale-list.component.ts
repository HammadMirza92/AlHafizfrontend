import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { VoucherService } from '../../../../core/services/voucher.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { Voucher } from '../../../../core/models/voucher.model';
import { Customer } from '../../../../core/models/customer.model';
import { VoucherType, PaymentType } from '../../../../core/models/enums.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.scss']
})
export class SaleListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'date', 'customer', 'paymentType', 'bank', 'amount', 'details', 'edit', 'delete'];
  dataSource = new MatTableDataSource<Voucher>([]);
  customers: Customer[] = [];
  filterForm: FormGroup;
  paymentTypes = PaymentType;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
      customerId: [null]
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
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
    });
  }

  loadVouchers(): void {
    const filter = {
      voucherType: VoucherType.Sale,
      fromDate: this.filterForm.value.fromDate,
      toDate: this.filterForm.value.toDate,
      customerId: this.filterForm.value.customerId
    };

    this.voucherService.filterVouchers(filter).subscribe(vouchers => {
      this.dataSource.data = vouchers;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  getTotalAmount(voucher: Voucher): number {
    if (!voucher.voucherItems || voucher.voucherItems.length === 0) {
      return 0;
    }
    return voucher.voucherItems.reduce((total, item) => total + item.amount, 0);
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
        message: `Are you sure you want to delete Sale Voucher #${voucher.id}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voucherService.deleteVoucher(voucher.id).subscribe({
          next: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Sale Voucher deleted successfully!',
                type: 'success'
              },
              duration: 3000
            });
            this.loadVouchers();
          },
          error: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Error deleting Sale Voucher. Please try again.',
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
