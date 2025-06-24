import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BankService } from '../../../core/services/bank.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-bank-form',
  templateUrl: './bank-form.component.html',
  styleUrls: ['./bank-form.component.scss']
})
export class BankFormComponent implements OnInit {
  bankForm: FormGroup;
  isEditMode = false;
  bankId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private bankService: BankService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.bankForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.bankId = +id;
      this.loadBank(this.bankId);
    }
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  loadBank(id: number): void {
    this.bankService.getBank(id).subscribe({
      next: (bank) => {
        this.bankForm.patchValue({
          name: bank.name
        });
      },
      error: () => {
        this.showError('Bank not found');
        this.router.navigate(['/banks']);
      }
    });
  }

  onSubmit(): void {
    if (this.bankForm.invalid) {
      return;
    }

    const formValue = this.bankForm.value;

    if (this.isEditMode && this.bankId) {
      this.bankService.updateBank(this.bankId, { name: formValue.name }).subscribe({
        next: () => {
          this.showSuccess('Bank updated successfully');
          this.router.navigate(['/banks']);
        },
        error: () => {
          this.showError('Error updating bank');
        }
      });
    } else {
      this.bankService.createBank({ name: formValue.name }).subscribe({
        next: () => {
          this.showSuccess('Bank created successfully');
          this.router.navigate(['/banks']);
        },
        error: () => {
          this.showError('Error creating bank');
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
