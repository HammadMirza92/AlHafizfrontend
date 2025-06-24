import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BankService } from '../../../core/services/bank.service';
import { Bank } from '../../../core/models/bank.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
  styleUrls: ['./bank-list.component.scss']
})
export class BankListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<Bank>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private bankService: BankService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBanks(): void {
    this.bankService.getBanks().subscribe(banks => {
      this.dataSource.data = banks;
    });
  }

  deleteBank(bank: Bank): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete bank ${bank.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bankService.deleteBank(bank.id).subscribe({
          next: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Bank deleted successfully!',
                type: 'success'
              },
              duration: 3000
            });
            this.loadBanks();
          },
          error: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Error deleting bank. It may be in use.',
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
