import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { VoucherService } from '../../../../core/services/voucher.service';
import { Voucher } from '../../../../core/models/voucher.model';
import { VoucherType, PaymentType } from '../../../../core/models/enums.model';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchase-detail.component.html',
  styleUrls: ['./purchase-detail.component.scss']
})
export class PurchaseDetailComponent implements OnInit {
  voucher: Voucher | null = null;
  loading = true;
  printing = false;
  paymentTypes = PaymentType;
  itemDisplayColumns: string[] = ['item', 'weight', 'kat', 'netWeight', 'desiMan', 'rate', 'amount'];

  constructor(
    private voucherService: VoucherService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVoucher();
  }

  loadVoucher(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.voucherService.getVoucher(+id).subscribe({
        next: (voucher) => {
          if (voucher) {
            this.voucher = voucher;
          } else {
            this.voucher = null;
            this.showErrorMessage('Voucher not found');
            this.router.navigate(['/vouchers/purchase']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading voucher:', error);
          this.voucher = null;
          this.loading = false;
          this.showErrorMessage('Error loading voucher details');
          this.router.navigate(['/vouchers/purchase']);
        }
      });
    } else {
      this.voucher = null;
      this.loading = false;
      this.router.navigate(['/vouchers/purchase']);
    }
  }

  getPaymentTypeText(paymentType: string): string {
    switch (paymentType) {
      case 'Cash':
        return 'Cash Payment';
      case 'Bank':
        return 'Bank Transfer';
      case 'Credit':
        return 'Credit Payment';
      default:
        return 'Unknown Payment';
    }
  }

  getPaymentTypeIcon(paymentType: string): string {
    switch (paymentType) {
       case 'Cash':
        return 'Cash Payment';
      case 'Bank':
        return 'Bank Transfer';
      case 'Credit':
        return 'Credit Payment';
      default:
        return 'Unknown Payment';
    }
  }

  getPaymentTypeClass(paymentType: string): string {
    switch (paymentType) {
      case 'Cash':
        return 'payment-cash';
      case 'Bank':
        return 'payment-bank';
      case 'Credit':
        return 'payment-credit';
      default:
        return '';
    }
  }

  getVoucherStatus(): { text: string; class: string; icon: string } {
    // You can implement status logic based on your business rules
    return {
      text: 'Completed',
      class: 'status-completed',
      icon: 'check_circle'
    };
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Calculation methods
  getTotalWeight(): number {
    if (!this.voucher?.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + (item.weight || 0), 0);
  }

  getTotalKat(): number {
    if (!this.voucher?.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + (item.kat || 0), 0);
  }

  getTotalNetWeight(): number {
    if (!this.voucher?.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + (item.netWeight || 0), 0);
  }

  getTotalDesiMan(): number {
    if (!this.voucher?.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + (item.desiMan || 0), 0);
  }

  getTotalAmount(): number {
    if (!this.voucher?.voucherItems) return 0;
    return this.voucher.voucherItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  getAverageRate(): number {
    if (!this.voucher?.voucherItems?.length) return 0;
    const totalRate = this.voucher.voucherItems.reduce((sum, item) => sum + (item.rate || 0), 0);
    return totalRate / this.voucher.voucherItems.length;
  }

  getHighestRateItem(): any {
    if (!this.voucher?.voucherItems?.length) return null;
    return this.voucher.voucherItems.reduce((highest, item) =>
      (item.rate || 0) > (highest.rate || 0) ? item : highest
    );
  }

  getLowestRateItem(): any {
    if (!this.voucher?.voucherItems?.length) return null;
    return this.voucher.voucherItems.reduce((lowest, item) =>
      (item.rate || 0) < (lowest.rate || 0) ? item : lowest
    );
  }

  // Actions
  printVoucher(): void {
    this.printing = true;
    try {
      // Add a small delay to show the loading state
      setTimeout(() => {
        window.print();
        this.printing = false;
      }, 500);
    } catch (error) {
      console.error('Print error:', error);
      this.showErrorMessage('Error printing voucher');
      this.printing = false;
    }
  }

  downloadVoucher(): void {
    // Implement PDF download functionality
    this.showSuccessMessage('Download feature will be implemented soon');
  }

  shareVoucher(): void {
    if (navigator.share) {
      navigator.share({
        title: `Purchase Voucher #${this.voucher?.id}`,
        text: `Purchase voucher for ${this.voucher?.customerName}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.showSuccessMessage('Voucher URL copied to clipboard');
      }).catch(() => {
        this.showErrorMessage('Could not copy URL to clipboard');
      });
    }
  }

  editVoucher(): void {
    if (this.voucher) {
      this.router.navigate(['../edit', this.voucher.id], { relativeTo: this.route });
    }
  }

  duplicateVoucher(): void {
    if (this.voucher) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '450px',
        data: {
          title: 'Duplicate Voucher',
          message: 'Are you sure you want to create a duplicate of this voucher?',
          details: 'This will create a new voucher with the same items and details.'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Navigate to create form with pre-filled data
          this.router.navigate(['/vouchers/purchase/new'], {
            state: { duplicateData: this.voucher }
          });
        }
      });
    }
  }

  deleteVoucher(): void {
    if (this.voucher) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '450px',
        data: {
          title: 'Delete Voucher',
          message: `Are you sure you want to delete Purchase Voucher #${this.voucher.id}?`,
          details: 'This action cannot be undone.',
          isDestructive: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.voucher) {
          this.voucherService.deleteVoucher(this.voucher.id).subscribe({
            next: () => {
              this.showSuccessMessage('Voucher deleted successfully');
              this.router.navigate(['/vouchers/purchase']);
            },
            error: () => {
              this.showErrorMessage('Error deleting voucher');
            }
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/vouchers/purchase']);
  }

  // Helper methods for display
  getItemPercentage(itemAmount: number): number {
    const total = this.getTotalAmount();
    return total > 0 ? (itemAmount / total) * 100 : 0;
  }

  isLargestItem(item: any): boolean {
    if (!this.voucher?.voucherItems?.length) return false;
    const maxAmount = Math.max(...this.voucher.voucherItems.map(i => i.amount || 0));
    return (item.amount || 0) === maxAmount;
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
}
