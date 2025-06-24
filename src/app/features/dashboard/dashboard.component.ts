import { Component, OnInit } from '@angular/core';
import { VoucherService } from '../../core/services/voucher.service';
import { VoucherType } from '../../core/models/enums.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  purchaseCount = 0;
  saleCount = 0;
  expenseCount = 0;
  cashBalance = 0;

  constructor(private voucherService: VoucherService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.voucherService.getVouchers().subscribe(vouchers => {
      this.purchaseCount = vouchers.filter(v => v.voucherType === VoucherType.Purchase).length;
      this.saleCount = vouchers.filter(v => v.voucherType === VoucherType.Sale).length;
      this.expenseCount = vouchers.filter(v => v.voucherType === VoucherType.Expense).length;

      // Calculate cash balance
      const purchases = vouchers.filter(v => v.voucherType === VoucherType.Purchase);
      const sales = vouchers.filter(v => v.voucherType === VoucherType.Sale);
      const expenses = vouchers.filter(v => v.voucherType === VoucherType.Expense);
      const hazri = vouchers.filter(v => v.voucherType === VoucherType.Hazri);
      const cashPaid = vouchers.filter(v => v.voucherType === VoucherType.CashPaid);
      const cashReceived = vouchers.filter(v => v.voucherType === VoucherType.CashReceived);

      // Sum up amounts
      const purchaseAmount = purchases.reduce((total, v) => total + (v.amount || 0), 0);
      const saleAmount = sales.reduce((total, v) => total + (v.amount || 0), 0);
      const expenseAmount = expenses.reduce((total, v) => total + (v.amount || 0), 0);
      const hazriAmount = hazri.reduce((total, v) => total + (v.amount || 0), 0);
      const cashPaidAmount = cashPaid.reduce((total, v) => total + (v.amount || 0), 0);
      const cashReceivedAmount = cashReceived.reduce((total, v) => total + (v.amount || 0), 0);

      // Calculate balance
      this.cashBalance = saleAmount + cashReceivedAmount - purchaseAmount - expenseAmount - hazriAmount - cashPaidAmount;
    });
  }
}
