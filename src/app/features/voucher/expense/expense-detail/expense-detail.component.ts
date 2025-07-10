import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoucherService } from '../../../../core/services/voucher.service';
import { Voucher } from '../../../../core/models/voucher.model';
import { VoucherType, PaymentType } from '../../../../core/models/enums.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss']
})
export class ExpenseDetailComponent implements OnInit {
  voucher: Voucher | null = null;
  loading = true;
  paymentTypes = PaymentType;

  constructor(
    private voucherService: VoucherService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadVoucher();
  }

  loadVoucher(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.voucherService.getVoucher(+id).subscribe({
        next: (voucher) => {
          // Ensure it's an Expense voucher
          if (voucher && voucher.voucherType === VoucherType.Expense) {
            this.voucher = voucher;
          } else {
            this.showError('Voucher not found or is not an Expense voucher');
            this.router.navigate(['/vouchers/expense']);
          }
          this.loading = false;
        },
        error: (error) => {
          this.showError('Error loading voucher');
          console.error(error);
          this.voucher = null;
          this.loading = false;
          this.router.navigate(['/vouchers/expense']);
        }
      });
    } else {
      this.voucher = null;
      this.loading = false;
      this.router.navigate(['/vouchers/expense']);
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

  printVoucher(): void {
    window.print();
  }

  showError(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'error' },
      duration: 3000
    });
  }
}
