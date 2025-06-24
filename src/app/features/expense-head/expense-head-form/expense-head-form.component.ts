import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseHeadService } from '../../../core/services/expense-head.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-expense-head-form',
  templateUrl: './expense-head-form.component.html',
  styleUrls: ['./expense-head-form.component.scss']
})
export class ExpenseHeadFormComponent implements OnInit {
  expenseHeadForm: FormGroup;
  isEditMode = false;
  expenseHeadId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private expenseHeadService: ExpenseHeadService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.expenseHeadForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.expenseHeadId = +id;
      this.loadExpenseHead(this.expenseHeadId);
    }
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  loadExpenseHead(id: number): void {
    this.expenseHeadService.getExpenseHead(id).subscribe({
      next: (expenseHead) => {
        this.expenseHeadForm.patchValue({
          name: expenseHead.name
        });
      },
      error: () => {
        this.showError('Expense head not found');
        this.router.navigate(['/expense-heads']);
      }
    });
  }

  onSubmit(): void {
    if (this.expenseHeadForm.invalid) {
      return;
    }

    const formValue = this.expenseHeadForm.value;

    if (this.isEditMode && this.expenseHeadId) {
      this.expenseHeadService.updateExpenseHead(this.expenseHeadId, { name: formValue.name }).subscribe({
        next: () => {
          this.showSuccess('Expense head updated successfully');
          this.router.navigate(['/expense-heads']);
        },
        error: () => {
          this.showError('Error updating expense head');
        }
      });
    } else {
      this.expenseHeadService.createExpenseHead({ name: formValue.name }).subscribe({
        next: () => {
          this.showSuccess('Expense head created successfully');
          this.router.navigate(['/expense-heads']);
        },
        error: () => {
          this.showError('Error creating expense head');
        }
      });
    }
  }

  showSuccess(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'success' },
      duration: 3000
    });
  }

  showError(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'error' },
      duration: 3000
    });
  }
}
