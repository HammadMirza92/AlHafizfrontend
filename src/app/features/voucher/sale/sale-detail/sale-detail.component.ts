import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoucherService } from '../../../../core/services/voucher.service';
import { Voucher } from '../../../../core/models/voucher.model';
import { VoucherType, PaymentType } from '../../../../core/models/enums.model';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss']
})
export class SaleDetailComponent implements OnInit {
  voucher: Voucher | null = null;
  loading = true;
  paymentTypes = PaymentType;
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
          // Ensure it's a Sale voucher
          if (voucher && voucher.voucherType === VoucherType.Sale) {
            this.voucher = voucher;
          } else {
            this.voucher = null;
            this.router.navigate(['/vouchers/sale']);
          }
          this.loading = false;
        },
        error: () => {
          this.voucher = null;
          this.loading = false;
          this.router.navigate(['/vouchers/sale']);
        }
      });
    } else {
      this.voucher = null;
      this.loading = false;
      this.router.navigate(['/vouchers/sale']);
    }
  }

  getPaymentTypeText(paymentType: string): string {
    switch (paymentType) {
      case 'Cash':
        return 'Cash';
      case 'Bank':
        return 'Bank';
      case 'Credit':
        return 'Credit';
      default:
        return '';
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
