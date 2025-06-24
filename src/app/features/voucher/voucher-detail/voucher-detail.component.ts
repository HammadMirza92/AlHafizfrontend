import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoucherService } from '../../../core/services/voucher.service';
import { Voucher } from '../../../core/models/voucher.model';
import { VoucherType, PaymentType } from '../../../core/models/enums.model';
import { VoucherItem } from '../../../core/models/voucher-item.model';

@Component({
  selector: 'app-voucher-detail',
  templateUrl: './voucher-detail.component.html',
  styleUrls: ['./voucher-detail.component.scss']
})
export class VoucherDetailComponent implements OnInit {
  voucher: Voucher | null = null;
  loading = true;
  voucherType: VoucherType = VoucherType.Purchase; // Default
  itemDisplayColumns: string[] = ['item', 'weight', 'kat', 'netWeight', 'desiMan', 'rate', 'amount'];

  constructor(
    private voucherService: VoucherService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVoucher();
  }

  loadVoucher(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.voucherService.getVoucher(+id).subscribe({
        next: (voucher) => {
          this.voucher = voucher;
          this.voucherType = voucher.voucherType;
          this.loading = false;
        },
        error: () => {
          this.voucher = null;
          this.loading = false;
        }
      });
    } else {
      this.voucher = null;
      this.loading = false;
    }
  }

  getVoucherTypeTitle(): string {
    if (!this.voucher) return '';

    switch (this.voucher.voucherType) {
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
        return '';
    }
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

  isPurchaseOrSale(voucher: Voucher): boolean {
    return voucher.voucherType === VoucherType.Purchase || voucher.voucherType === VoucherType.Sale;
  }

  isVoucherWithAmount(voucher: Voucher): boolean {
    return voucher.voucherType === VoucherType.Expense ||
           voucher.voucherType === VoucherType.Hazri ||
           voucher.voucherType === VoucherType.CashPaid ||
           voucher.voucherType === VoucherType.CashReceived;
  }

  getListPath(): string {
    switch (this.voucherType) {
      case VoucherType.Purchase:
        return '/vouchers/purchase';
      case VoucherType.Sale:
        return '/vouchers/sale';
      case VoucherType.Expense:
        return '/vouchers/expense';
      case VoucherType.Hazri:
        return '/vouchers/hazri';
      case VoucherType.CashPaid:
        return '/vouchers/cash-paid';
      case VoucherType.CashReceived:
        return '/vouchers/cash-received';
      default:
        return '/vouchers';
    }
  }

  getTotalWeight(): number {
    if (!this.voucher || !this.voucher.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + item.weight, 0);
  }

  getTotalKat(): number {
    if (!this.voucher || !this.voucher.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + item.kat, 0);
  }

  getTotalNetWeight(): number {
    if (!this.voucher || !this.voucher.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + item.netWeight, 0);
  }

  getTotalDesiMan(): number {
    if (!this.voucher || !this.voucher.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + item.desiMan, 0);
  }

  getTotalAmount(): number {
    if (!this.voucher || !this.voucher.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + item.amount, 0);
  }

  printVoucher(): void {
    window.print();
  }
}
