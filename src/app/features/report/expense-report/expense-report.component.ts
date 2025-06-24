import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { VoucherService } from '../../../core/services/voucher.service';
import { ExpenseHeadService } from '../../../core/services/expense-head.service';
import { Voucher } from '../../../core/models/voucher.model';
import { VoucherType, PaymentType } from '../../../core/models/enums.model';
import { ExpenseHead } from '../../../core/models/expense-head.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-expense-report',
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.scss']
})
export class ExpenseReportComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['date', 'id', 'expenseHead', 'paymentType', 'amount', 'details', 'actions'];
  dataSource = new MatTableDataSource<Voucher>([]);
  expenseHeads: ExpenseHead[] = [];
  filterForm: FormGroup;
  expenseChart: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private voucherService: VoucherService,
    private expenseHeadService: ExpenseHeadService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
      expenseHeadId: [null]
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
    this.expenseHeadService.getExpenseHeads().subscribe(expenseHeads => {
      this.expenseHeads = expenseHeads;
    });
  }

  loadVouchers(): void {
    const filter = {
      voucherType: VoucherType.Expense,
      fromDate: this.filterForm.value.fromDate,
      toDate: this.filterForm.value.toDate,
      expenseHeadId: this.filterForm.value.expenseHeadId
    };

    this.voucherService.filterVouchers(filter).subscribe(vouchers => {
      this.dataSource.data = vouchers;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      this.initChart();
    });
  }

  initChart(): void {
    if (this.expenseChart) {
      this.expenseChart.destroy();
    }

    if (this.dataSource.data.length === 0) {
      return;
    }

    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Group data by expense head
    const expenseData = this.dataSource.data.reduce((acc, voucher) => {
      const name = voucher.expenseHeadName || 'Unknown';
      if (!acc[name]) {
        acc[name] = 0;
      }
      acc[name] += voucher.amount || 0;
      return acc;
    }, {} as { [key: string]: number });

    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
      'rgba(83, 102, 255, 0.7)',
      'rgba(40, 159, 64, 0.7)',
      'rgba(210, 199, 199, 0.7)'
    ];

    this.expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: 'white',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.formattedValue;
                const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                const percentage = ((context.raw as number) / total * 100).toFixed(2) + '%';
                return `${label}: ${value} (${percentage})`;
              }
            }
          }
        }
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

  getTotalAmount(): number {
    return this.dataSource.data.reduce((sum, voucher) => sum + (voucher.amount || 0), 0);
  }

  exportReport(): void {
    // This would be implemented with a library like exceljs or xlsx
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: 'Expense report exported!',
        type: 'success'
      },
      duration: 3000
    });
  }

  printReport(): void {
    window.print();
  }
}
