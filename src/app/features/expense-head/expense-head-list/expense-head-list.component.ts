import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseHeadService } from '../../../core/services/expense-head.service';
import { ExpenseHead } from '../../../core/models/expense-head.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-expense-head-list',
  templateUrl: './expense-head-list.component.html',
  styleUrls: ['./expense-head-list.component.scss']
})
export class ExpenseHeadListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<ExpenseHead>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private expenseHeadService: ExpenseHeadService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadExpenseHeads();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadExpenseHeads(): void {
    this.expenseHeadService.getExpenseHeads().subscribe(expenseHeads => {
      this.dataSource.data = expenseHeads;
    });
  }

  deleteExpenseHead(expenseHead: ExpenseHead): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete expense head ${expenseHead.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.expenseHeadService.deleteExpenseHead(expenseHead.id).subscribe({
          next: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Expense head deleted successfully!',
                type: 'success'
              },
              duration: 3000
            });
            this.loadExpenseHeads();
          },
          error: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Error deleting expense head. It may be in use.',
                type: 'error'
              },
              duration: 3000
            });
          }
        });
      }
    });
  }
}
