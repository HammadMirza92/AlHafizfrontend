import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemService } from '../../../core/services/item.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent implements OnInit {
  itemForm: FormGroup;
  isEditMode = false;
  itemId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.itemForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.itemId = +id;
      this.loadItem(this.itemId);
    }
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  loadItem(id: number): void {
    this.itemService.getItem(id).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          name: item.name
        });
      },
      error: () => {
        this.showError('Item not found');
        this.router.navigate(['/items']);
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      return;
    }

    const formValue = this.itemForm.value;

    if (this.isEditMode && this.itemId) {
      this.itemService.updateItem(this.itemId, { name: formValue.name }).subscribe({
        next: () => {
          this.showSuccess('Item updated successfully');
          this.router.navigate(['/items']);
        },
        error: () => {
          this.showError('Error updating item');
        }
      });
    } else {
      this.itemService.createItem({ name: formValue.name }).subscribe({
        next: () => {
          this.showSuccess('Item created successfully');
          this.router.navigate(['/items']);
        },
        error: () => {
          this.showError('Error creating item');
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
