import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CashTransactionService } from '../../../../core/services/cash-transaction.service';
import { CashTransaction } from '../../../../core/models/cash-transaction.model';
import { PaymentType } from '../../../../core/models/enums.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-cash-paid-detail',
  templateUrl: './cash-paid-detail.component.html',
  styleUrls: ['./cash-paid-detail.component.scss']
})
export class CashPaidDetailComponent implements OnInit {
  transaction: CashTransaction | null = null;
  loading = true;
  paymentTypes = PaymentType;

  constructor(
    private cashTransactionService: CashTransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTransaction();
  }

  loadTransaction(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cashTransactionService.getCashTransaction(+id).subscribe({
        next: (transaction) => {
          // Ensure it's a Cash Paid transaction
          if (transaction && !transaction.isCashReceived) {
            this.transaction = transaction;
          } else {
            this.showError('Transaction not found or is not a Cash Paid transaction');
            this.router.navigate(['/vouchers/cash-paid']);
          }
          this.loading = false;
        },
        error: (error) => {
          this.showError('Error loading transaction');
          console.error(error);
          this.transaction = null;
          this.loading = false;
          this.router.navigate(['/vouchers/cash-paid']);
        }
      });
    } else {
      this.transaction = null;
      this.loading = false;
      this.router.navigate(['/vouchers/cash-paid']);
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

  printTransaction(): void {
    window.print();
  }

  showError(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'error' },
      duration: 3000
    });
  }
}
