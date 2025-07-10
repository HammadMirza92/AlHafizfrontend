// components/set-rate-dialog/set-rate-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-set-rate-dialog',
  template: `
    <h2 mat-dialog-title>Set Rate</h2>

    <mat-dialog-content>
      <form [formGroup]="rateForm" class="rate-form">
        <div class="customer-item-info">
          <p><strong>Customer:</strong> {{data.customerName}}</p>
          <p><strong>Item:</strong> {{data.itemName}}</p>
          <p *ngIf="data.rate"><strong>Current Rate:</strong> {{data.rate | currency}}</p>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rate</mat-label>
          <input matInput
                 type="number"
                 step="0.01"
                 min="0"
                 formControlName="rate"
                 placeholder="Enter rate">
          <span matSuffix>PKR</span>
          <mat-error *ngIf="rateForm.get('rate')?.hasError('required')">
            Rate is required
          </mat-error>
          <mat-error *ngIf="rateForm.get('rate')?.hasError('min')">
            Rate must be greater than 0
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions >
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="onSave()"
              [disabled]="rateForm.invalid">
        {{data.rate ? 'Update' : 'Set'}} Rate
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .rate-form {
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .customer-item-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;

      p {
        margin: 4px 0;

        strong {
          color: #333;
        }
      }
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 0;
      gap: 8px;
    }
  `]
})
export class SetRateDialogComponent implements OnInit {
  rateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SetRateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.rateForm = this.fb.group({
      rate: [data.rate || '', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    // Focus on the rate input when dialog opens
    setTimeout(() => {
      const rateInput = document.querySelector('input[formControlName="rate"]') as HTMLInputElement;
      if (rateInput) {
        rateInput.focus();
        rateInput.select();
      }
    }, 100);
  }

  onSave(): void {
    if (this.rateForm.valid) {
      const rate = parseFloat(this.rateForm.get('rate')?.value);
      this.dialogRef.close(rate);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
