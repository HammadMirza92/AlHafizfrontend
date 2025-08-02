import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { VoucherService } from '../../../core/services/voucher.service';
import { CustomerService } from '../../../core/services/customer.service';
import { Voucher } from '../../../core/models/voucher.model';
import { VoucherType, PaymentType } from '../../../core/models/enums.model';
import { Customer } from '../../../core/models/customer.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-purchase-report',
  templateUrl: './purchase-report.component.html',
  styleUrls: ['./purchase-report.component.scss']
})
export class PurchaseReportComponent implements OnInit {
  displayedColumns: string[] = ['date', 'id', 'customer', 'items', 'weight','kat','netweight','rate', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Voucher>([]);
  customers: Customer[] = [];
  filterForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
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
      voucherType: VoucherType.Purchase,
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

  applyFilter(): void {
    this.loadVouchers();
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.loadVouchers();
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

  getVoucherTotalWeight(voucher: Voucher): number {
    if (!voucher.voucherItems || voucher.voucherItems.length === 0) return 0;
    return voucher.voucherItems.reduce((sum, item) => sum + item.netWeight, 0);
  }

  getVoucherTotalAmount(voucher: Voucher): number {
    if (!voucher.voucherItems || voucher.voucherItems.length === 0) return 0;
    return voucher.voucherItems.reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalVouchers(): number {
    return this.dataSource.data.length;
  }

  getTotalAmount(): number {
    return this.dataSource.data.reduce((sum, voucher) => sum + this.getVoucherTotalAmount(voucher), 0);
  }

  getTotalWeight(): number {
    return this.dataSource.data.reduce((sum, voucher) => sum + this.getVoucherTotalWeight(voucher), 0);
  }

  getAverageRate(): number {
    const totalAmount = this.getTotalAmount();
    const totalWeight = this.getTotalWeight();
    return totalWeight > 0 ? totalAmount / totalWeight : 0;
  }

  exportReport(): void {
    // This would be implemented with a library like exceljs or xlsx
    // For now, we'll just show a success message
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: 'Purchase report exported!',
        type: 'success'
      },
      duration: 3000
    });
  }

  printReport(): void {
    window.print();
  }
}
