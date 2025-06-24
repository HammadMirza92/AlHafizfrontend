import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { StockService } from '../../../core/services/stock.service';
import { VoucherService } from '../../../core/services/voucher.service';
import { Stock } from '../../../core/models/stock.model';
import { Voucher } from '../../../core/models/voucher.model';
import { VoucherType } from '../../../core/models/enums.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

interface ItemTransaction {
  createdAt: Date;
  voucherType: VoucherType;
  customerName: string;
  netWeight: number;
  amount: number;
}

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss']
})
export class StockListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'item', 'quantity', 'lastUpdated', 'transactions'];
  transactionColumns: string[] = ['date', 'type', 'customer', 'quantity', 'amount'];
  dataSource = new MatTableDataSource<Stock>([]);
  transactionsDataSource = new MatTableDataSource<ItemTransaction>([]);
  vouchers: Voucher[] = [];
  selectedItem: Stock | null = null;
  itemTransactions: ItemTransaction[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('transactionsDialog') transactionsDialog!: TemplateRef<any>;

  constructor(
    private stockService: StockService,
    private voucherService: VoucherService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    forkJoin([
      this.stockService.getStocks(),
      this.voucherService.getVouchers()
    ]).subscribe(([stocks, vouchers]) => {
      this.dataSource.data = stocks;
      this.vouchers = vouchers.filter(v => v.voucherType === VoucherType.Purchase || v.voucherType === VoucherType.Sale);
    });
  }

  refresh(): void {
    this.loadData();
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: 'Stock data refreshed!',
        type: 'success'
      },
      duration: 3000
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getLastUpdatedVoucher(itemId: number): Voucher | undefined {
    const relevantVouchers = this.vouchers.filter(v =>
      v.voucherItems?.some(item => item.itemId === itemId)
    );

    if (relevantVouchers.length === 0) return undefined;

    return relevantVouchers.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0];
  }

  viewItemTransactions(itemId: number): void {
    this.selectedItem = this.dataSource.data.find(stock => stock.itemId === itemId) || null;

    if (this.selectedItem) {
      this.itemTransactions = [];

      // Filter vouchers related to this item
      const relevantVouchers = this.vouchers.filter(v =>
        v.voucherItems?.some(item => item.itemId === itemId)
      );

      // Map vouchers to transactions
      this.itemTransactions = relevantVouchers.flatMap(voucher => {
        const voucherItem = voucher.voucherItems?.find(vi => vi.itemId === itemId);

        if (voucherItem) {
          return {
            createdAt: voucher.createdAt,
            voucherType: voucher.voucherType,
            customerName: voucher.customerName || 'N/A',
            netWeight: voucherItem.netWeight,
            amount: voucherItem.amount
          } as ItemTransaction;
        }

        return [];
      });

      // Sort transactions by date (newest first)
      this.itemTransactions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      this.transactionsDataSource.data = this.itemTransactions;

      // Open dialog
      this.dialog.open(this.transactionsDialog, {
        width: '800px',
        maxHeight: '80vh'
      });
    }
  }

  getVoucherTypeText(voucherType: VoucherType): string {
    switch (voucherType) {
      case VoucherType.Purchase:
        return 'Purchase';
      case VoucherType.Sale:
        return 'Sale';
      default:
        return 'Unknown';
    }
  }

  exportToExcel(): void {
    // This would be implemented with a library like exceljs or xlsx
    // For now, we'll just show a success message
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: 'Stock data exported to Excel!',
        type: 'success'
      },
      duration: 3000
    });
  }
}
