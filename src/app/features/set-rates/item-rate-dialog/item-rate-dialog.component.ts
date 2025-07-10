// components/item-rate-dialog/item-rate-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RateManagementService } from 'src/app/core/services/rateManagement.service';

interface ItemDialogData {
  item?: any;
  customers: any[];
}

@Component({
  selector: 'app-item-rate-dialog',
  template: `
    <h2 mat-dialog-title>{{data.item ? 'Edit' : 'Add'}} Item</h2>

    <mat-dialog-content>
      <form [formGroup]="itemForm" class="item-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Item Name</mat-label>
          <input matInput
                 formControlName="name"
                 placeholder="Enter item name">
          <mat-error *ngIf="itemForm.get('name')?.hasError('required')">
            Item name is required
          </mat-error>
          <mat-error *ngIf="itemForm.get('name')?.hasError('minlength')">
            Item name must be at least 2 characters
          </mat-error>
          <mat-error *ngIf="itemForm.get('name')?.hasError('maxlength')">
            Item name cannot exceed 100 characters
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions >
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="onSave()"
              [disabled]="itemForm.invalid || loading">
        <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
        {{data.item ? 'Update' : 'Create'}} Item
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .item-form {
      min-width: 350px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 0;
      gap: 8px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    mat-spinner {
      margin: 0;
    }
  `]
})
export class ItemRateDialogComponent implements OnInit {
  itemForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ItemRateDialogComponent>,
    private rateManagementService: RateManagementService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: ItemDialogData
  ) {
    this.itemForm = this.fb.group({
      name: [
        data.item?.name || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ]
    });
  }

  ngOnInit(): void {
    // Focus on the name input when dialog opens
    setTimeout(() => {
      const nameInput = document.querySelector('input[formControlName="name"]') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
    }, 100);
  }

  onSave(): void {
    if (this.itemForm.valid && !this.loading) {
      this.loading = true;
      const itemData = {
        name: this.itemForm.get('name')?.value.trim()
      };

      const operation = this.data.item
        ? this.rateManagementService.updateItem(this.data.item.id, itemData)
        : this.rateManagementService.createItem(itemData);

      operation.subscribe({
        next: (result) => {
          this.loading = false;
          const action = this.data.item ? 'updated' : 'created';
          this.snackBar.open(`Item ${action} successfully`, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving item:', error);
          this.snackBar.open('Error saving item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
