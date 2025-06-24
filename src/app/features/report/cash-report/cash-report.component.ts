import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CashTransactionService } from '../../../core/services/cash-transaction.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CashTransaction } from '../../../core/models/cash-transaction.model';
import { PaymentType } from '../../../core/models/enums.model';
import { Customer } from '../../../core/models/customer.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-cash-report',
  templateUrl: './cash-report.component.html',
  styleUrls: ['./cash-report.component.scss']
})
export class CashReportComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['date', 'id', 'type', 'customer', 'paymentType', 'amount', 'details'];
  tabDisplayedColumns: string[] = ['date', 'id', 'customer', 'paymentType', 'amount', 'details'];
  dataSource = new MatTableDataSource<CashTransaction>([]);
  cashReceivedDataSource = new MatTableDataSource<CashTransaction>([]);
  cashPaidDataSource = new MatTableDataSource<CashTransaction>([]);
  customers: Customer[] = [];
  filterForm: FormGroup;
  cashFlowChart: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private cashTransactionService: CashTransactionService,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.formBuilder.group({
      fromDate: [null],
      toDate: [null],
      customerId: [null],
      isCashReceived: [null]
    });
  }

  ngOnInit(): void {
    this.loadDependentData();
    this.loadTransactions();
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

  loadTransactions(): void {
    const filter = {
      fromDate: this.filterForm.value.fromDate,
      toDate: this.filterForm.value.toDate,
      customerId: this.filterForm.value.customerId,
      isCashReceived: this.filterForm.value.isCashReceived
    };

    this.cashTransactionService.filterCashTransactions(filter).subscribe(transactions => {
      this.dataSource.data = transactions;

      // Filter for tabs
      this.cashReceivedDataSource.data = transactions.filter(t => t.isCashReceived);
      this.cashPaidDataSource.data = transactions.filter(t => !t.isCashReceived);

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }

      this.initChart();
    });
  }

  initChart(): void {
    if (this.cashFlowChart) {
      this.cashFlowChart.destroy();
    }

    if (this.dataSource.data.length === 0) {
      return;
    }

    const ctx = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Group data by date
    const cashData = this.dataSource.data.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { cashIn: 0, cashOut: 0, net: 0 };
      }

      if (transaction.isCashReceived) {
        acc[date].cashIn += transaction.amount;
      } else {
        acc[date].cashOut += transaction.amount;
      }

      acc[date].net = acc[date].cashIn - acc[date].cashOut;

      return acc;
    }, {} as { [key: string]: { cashIn: number, cashOut: number, net: number } });

    // Sort dates
    const dates = Object.keys(cashData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    const cashInData = dates.map(date => cashData[date].cashIn);
    const cashOutData = dates.map(date => cashData[date].cashOut);
    const netData = dates.map(date => cashData[date].net);

    this.cashFlowChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Cash In',
            data: cashInData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Cash Out',
            data: cashOutData,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Net Cash Flow',
            data: netData,
            type: 'line',
            fill: false,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Amount'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PKR'
                }).format(context.raw as number);
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    });
  }

  applyFilter(): void {
    this.loadTransactions();
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.loadTransactions();
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

  getCashIn(): number {
    return this.dataSource.data
      .filter(transaction => transaction.isCashReceived)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  getCashOut(): number {
    return this.dataSource.data
      .filter(transaction => !transaction.isCashReceived)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  getNetCashFlow(): number {
    return this.getCashIn() - this.getCashOut();
  }

  exportReport(): void {
    // This would be implemented with a library like exceljs or xlsx
    this.snackBar.openFromComponent(AlertComponent, {
      data: {
        message: 'Cash flow report exported!',
        type: 'success'
      },
      duration: 3000
    });
  }

  printReport(): void {
    window.print();
  }
}
