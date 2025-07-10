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
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss']
})
export class PurchaseListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'date', 'customer', 'paymentType', 'bank', 'totalAmount', 'totalWeight', 'gariNo', 'actions'];
  dataSource = new MatTableDataSource<Voucher>([]);
  customers: Customer[] = [];
  filterForm: FormGroup;
  paymentTypes = PaymentType;
  loading = false;

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
      customerId: [null],
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

    // Custom sorting for specific columns
    this.dataSource.sortingDataAccessor = (item: Voucher, property: string) => {
      switch (property) {
        case 'totalAmount':
          return this.getTotalAmount(item);
        case 'totalWeight':
          return this.getTotalWeight(item);
        case 'date':
          return new Date(item.createdAt).getTime();
        default:
          return (item as any)[property];
      }
    };
  }

  loadDependentData(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.showErrorMessage('Error loading customers');
      }
    });
  }

  loadVouchers(): void {
    this.loading = true;

    const filter = {
      voucherType: VoucherType.Purchase,
      fromDate: this.filterForm.value.fromDate,
      toDate: this.filterForm.value.toDate,
      customerId: this.filterForm.value.customerId,
      paymentType: this.filterForm.value.paymentType
    };

    this.voucherService.filterVouchers(filter).subscribe({
      next: (vouchers) => {
        this.dataSource.data = vouchers;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
        this.showErrorMessage('Error loading purchase vouchers');
        this.loading = false;
      }
    });
  }

  getTotalAmount(voucher: Voucher): number {
    if (!voucher.voucherItems || voucher.voucherItems.length === 0) {
      return 0;
    }
    return voucher.voucherItems.reduce((total, item) => total + (item.amount || 0), 0);
  }

  getTotalWeight(voucher: Voucher): number {
    if (!voucher.voucherItems || voucher.voucherItems.length === 0) {
      return 0;
    }
    return voucher.voucherItems.reduce((total, item) => total + (item.netWeight || 0), 0);
  }

  getTotalItems(voucher: Voucher): number {
    return voucher.voucherItems ? voucher.voucherItems.length : 0;
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
        return 'Unknown';
    }
  }

  getPaymentTypeClass(paymentType: PaymentType): string {
    switch (paymentType) {
      case PaymentType.Cash:
        return 'payment-cash';
      case PaymentType.Bank:
        return 'payment-bank';
      case PaymentType.Credit:
        return 'payment-credit';
      default:
        return '';
    }
  }

  viewVoucherDetails(voucher: Voucher): void {
    this.router.navigate(['/vouchers/purchase', voucher.id]);
  }

  editVoucher(voucher: Voucher): void {
    this.router.navigate(['/vouchers/purchase/edit', voucher.id]);
  }

  deleteVoucher(voucher: Voucher): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete Purchase Voucher #${voucher.id}?`,
        details: `Customer: ${voucher.customerName}\nAmount: ${this.getTotalAmount(voucher).toFixed(2)}`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voucherService.deleteVoucher(voucher.id).subscribe({
          next: () => {
            this.showSuccessMessage('Purchase Voucher deleted successfully!');
            this.loadVouchers();
          },
          error: () => {
            this.showErrorMessage('Error deleting Purchase Voucher. Please try again.');
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

  exportToCSV(): void {
    // Implementation for CSV export
    console.log('Export to CSV functionality');
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: message,
        type: 'success'
      },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: message,
        type: 'error'
      },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
