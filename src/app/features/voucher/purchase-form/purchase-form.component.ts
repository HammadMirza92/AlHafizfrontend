import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { VoucherService } from '../../../core/services/voucher.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ItemService } from '../../../core/services/item.service';
import { BankService } from '../../../core/services/bank.service';
import { VoucherType, PaymentType } from '../../../core/models/enums.model';
import { Customer } from '../../../core/models/customer.model';
import { Item } from '../../../core/models/item.model';
import { Bank } from '../../../core/models/bank.model';
import { CreateVoucher, UpdateVoucher } from '../../../core/models/voucher.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss']
})
export class PurchaseFormComponent implements OnInit {
  purchaseForm: FormGroup;
  isEditMode = false;
  voucherId: number | null = null;
  customers: Customer[] = [];
  items: Item[] = [];
  banks: Bank[] = [];
  paymentTypes = PaymentType;

  constructor(
    private formBuilder: FormBuilder,
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private itemService: ItemService,
    private bankService: BankService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.purchaseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDependentData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.voucherId = +id;
      this.loadPurchaseVoucher(this.voucherId);
    }
  }

  get voucherItemsFormArray(): FormArray {
    return this.purchaseForm.get('voucherItems') as FormArray;
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      customerId: [null, Validators.required],
      paymentType: [PaymentType.Cash, Validators.required],
      bankId: [null],
      paymentDetails: [''],
      gariNo: [''],
      details: [''],
      voucherItems: this.formBuilder.array([])
    });
  }

  createVoucherItemFormGroup(item: any = null): FormGroup {
    return this.formBuilder.group({
      id: [item?.id || 0],
      itemId: [item?.itemId || null, Validators.required],
      weight: [item?.weight || 0, [Validators.required, Validators.min(0.01)]],
      kat: [item?.kat || 0, [Validators.required, Validators.min(0)]],
      netWeight: [item?.netWeight || 0, [Validators.required, Validators.min(0.01)]],
      desiMan: [item?.desiMan || 0, [Validators.required, Validators.min(0.001)]],
      rate: [item?.rate || 0, [Validators.required, Validators.min(0.01)]],
      amount: [item?.amount || 0, [Validators.required, Validators.min(0.01)]]
    });
  }

  loadDependentData(): void {
    forkJoin([
      this.customerService.getCustomers(),
      this.itemService.getItems(),
      this.bankService.getBanks()
    ]).subscribe(([customers, items, banks]) => {
      this.customers = customers;
      this.items = items;
      this.banks = banks;
    });
  }

  loadPurchaseVoucher(id: number): void {
    this.voucherService.getVoucher(id).subscribe(voucher => {
      if (voucher && voucher.voucherType === VoucherType.Purchase) {
        // Update form with voucher data
        this.purchaseForm.patchValue({
          customerId: voucher.customerId,
          paymentType: voucher.paymentType,
          bankId: voucher.bankId,
          paymentDetails: voucher.paymentDetails,
          gariNo: voucher.gariNo,
          details: voucher.details
        });

        // Clear existing voucher items and add the loaded ones
        while (this.voucherItemsFormArray.length) {
          this.voucherItemsFormArray.removeAt(0);
        }

        if (voucher.voucherItems && voucher.voucherItems.length > 0) {
          voucher.voucherItems.forEach(item => {
            this.voucherItemsFormArray.push(this.createVoucherItemFormGroup(item));
          });
        }
      } else {
        this.showError('Voucher not found or is not a Purchase voucher');
        this.router.navigate(['/vouchers/purchase']);
      }
    }, error => {
      this.showError('Error loading voucher');
      this.router.navigate(['/vouchers/purchase']);
    });
  }

  addItem(): void {
    this.voucherItemsFormArray.push(this.createVoucherItemFormGroup());
  }

  removeItem(index: number): void {
    this.voucherItemsFormArray.removeAt(index);
  }

  calculateNetWeight(index: number): void {
    const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
    const weight = itemGroup.get('weight')?.value || 0;
    const kat = itemGroup.get('kat')?.value || 0;
    const netWeight = Math.max(0, weight - kat);

    itemGroup.get('netWeight')?.setValue(netWeight, { emitEvent: false });

    // Recalculate desiMan and amount
    const desiMan = itemGroup.get('desiMan')?.value || 0;
    if (desiMan > 0) {
      this.calculateAmount(index);
    }
  }

  calculateAmount(index: number): void {
    const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
    const netWeight = itemGroup.get('netWeight')?.value || 0;
    const rate = itemGroup.get('rate')?.value || 0;
    const desiMan = itemGroup.get('desiMan')?.value || 0;

    // Formula: amount = desiMan * rate
    const amount = netWeight / desiMan * rate;

    itemGroup.get('amount')?.setValue(amount, { emitEvent: false });
  }

  getTotalAmount(): number {
    let total = 0;

    for (let i = 0; i < this.voucherItemsFormArray.length; i++) {
      const itemGroup = this.voucherItemsFormArray.at(i) as FormGroup;
      total += itemGroup.get('amount')?.value || 0;
    }

    return total;
  }

  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      return;
    }

    if (this.voucherItemsFormArray.length === 0) {
      this.showError('Please add at least one item');
      return;
    }

    const formValue = this.purchaseForm.value;


    if (this.isEditMode && this.voucherId) {
      this.voucherService.updateVoucher(this.voucherId, {
          voucherType: VoucherType.Purchase,
          customerId: formValue.customerId,
          paymentType: formValue.paymentType,
          bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
          paymentDetails: formValue.paymentDetails,
          gariNo: formValue.gariNo,
          details: formValue.details,
          voucherItems: formValue.voucherItems
        }).subscribe({
        next: () => {
          this.showSuccess('Purchase voucher updated successfully');
          this.router.navigate(['/vouchers/purchase']);
        },
        error: () => {
          this.showError('Error updating purchase voucher');
        }
      });
    } else {
      this.voucherService.createVoucher({
          voucherType: VoucherType.Purchase,
          customerId: formValue.customerId,
          paymentType: formValue.paymentType,
          bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
          paymentDetails: formValue.paymentDetails,
          gariNo: formValue.gariNo,
          details: formValue.details,
          voucherItems: formValue.voucherItems
        }).subscribe({
        next: () => {
          this.showSuccess('Purchase voucher created successfully');
          this.router.navigate(['/vouchers/purchase']);
        },
        error: () => {
          this.showError('Error creating purchase voucher');
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
