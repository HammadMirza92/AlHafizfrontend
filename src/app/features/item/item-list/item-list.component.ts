import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ItemService } from '../../../core/services/item.service';
import { StockService } from '../../../core/services/stock.service';
import { Item } from '../../../core/models/item.model';
import { Stock } from '../../../core/models/stock.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'stock', 'actions'];
  dataSource = new MatTableDataSource<Item>([]);
  searchTerm = '';
  stocks: Stock[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private itemService: ItemService,
    private stockService: StockService,
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
      this.itemService.getItems(),
      this.stockService.getStocks()
    ]).subscribe(([items, stocks]) => {
      this.dataSource.data = items;
      this.stocks = stocks;
    });
  }

  getStockForItem(itemId: number): Stock | undefined {
    return this.stocks.find(stock => stock.itemId === itemId);
  }

  applyFilter(): void {
    if (this.searchTerm.trim()) {
      this.itemService.searchItems(this.searchTerm).subscribe(items => {
        this.dataSource.data = items;
      });
    } else {
      this.loadData();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadData();
  }

  deleteItem(item: Item): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete item ${item.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.itemService.deleteItem(item.id).subscribe({
          next: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Item deleted successfully!',
                type: 'success'
              },
              duration: 3000
            });
            this.loadData();
          },
          error: () => {
            this.snackBar.openFromComponent(AlertComponent, {
              data: {
                message: 'Error deleting item. It may be in use.',
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
