import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { VoucherService } from '../../../core/services/voucher.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ItemService } from '../../../core/services/item.service';
import { BankService } from '../../../core/services/bank.service';
import { StockService } from '../../../core/services/stock.service';
import { VoucherType, PaymentType } from '../../../core/models/enums.model';
import { Customer } from '../../../core/models/customer.model';
import { Item } from '../../../core/models/item.model';
import { Bank } from '../../../core/models/bank.model';
import { Stock } from '../../../core/models/stock.model';
import { CreateVoucher, UpdateVoucher } from '../../../core/models/voucher.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.scss']
})
export class SaleFormComponent implements OnInit {
  saleForm: FormGroup;
  isEditMode = false;
  voucherId: number | null = null;
  customers: Customer[] = [];
  items: Item[] = [];
  banks: Bank[] = [];
  stockItems: Stock[] = [];
  paymentTypes = PaymentType;

  constructor(
    private formBuilder: FormBuilder,
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private itemService: ItemService,
    private bankService: BankService,
    private stockService: StockService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.saleForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDependentData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.voucherId = +id;
      this.loadSaleVoucher(this.voucherId);
    }
  }

  get voucherItemsFormArray(): FormArray {
    return this.saleForm.get('voucherItems') as FormArray;
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
      this.bankService.getBanks(),
      this.stockService.getStocks()
    ]).subscribe(([customers, items, banks, stocks]) => {
      this.customers = customers;
      this.items = items;
      this.banks = banks;
      this.stockItems = stocks.filter(s => s.quantity > 0); // Only show items with stock
    });
  }

  loadSaleVoucher(id: number): void {
    this.voucherService.getVoucher(id).subscribe(voucher => {
      if (voucher && voucher.voucherType === VoucherType.Sale) {
        // Update form with voucher data
        this.saleForm.patchValue({
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
        this.showError('Voucher not found or is not a Sale voucher');
        this.router.navigate(['/vouchers/sale']);
      }
    }, error => {
      this.showError('Error loading voucher');
      this.router.navigate(['/vouchers/sale']);
    });
  }

  addItem(): void {
    this.voucherItemsFormArray.push(this.createVoucherItemFormGroup());
  }

  removeItem(index: number): void {
    this.voucherItemsFormArray.removeAt(index);
  }

  onItemSelected(index: number): void {
    const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
    const itemId = itemGroup.get('itemId')?.value;

    if (itemId) {
      const stockItem = this.stockItems.find(s => s.itemId === itemId);
      if (stockItem) {
        // Validation: Check if there is enough stock
        itemGroup.get('weight')?.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.max(stockItem.quantity)
        ]);
        itemGroup.get('weight')?.updateValueAndValidity();
      }
    }
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
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }

    if (this.voucherItemsFormArray.length === 0) {
      this.showError('Please add at least one item');
      return;
    }

    // Validate stock availability
    for (let i = 0; i < this.voucherItemsFormArray.length; i++) {
      const itemGroup = this.voucherItemsFormArray.at(i) as FormGroup;
      const itemId = itemGroup.get('itemId')?.value;
      const netWeight = itemGroup.get('netWeight')?.value || 0;

      const stockItem = this.stockItems.find(s => s.itemId === itemId);
      if (stockItem && netWeight > stockItem.quantity) {
        this.showError(`Not enough stock for ${stockItem.itemName}. Available: ${stockItem.quantity}kg`);
        return;
      }
    }

    const formValue = this.saleForm.value;


    if (this.isEditMode && this.voucherId) {
      this.voucherService.updateVoucher(this.voucherId, {
          voucherType: VoucherType.Sale,
          customerId: formValue.customerId,
          paymentType: formValue.paymentType,
          bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
          paymentDetails: formValue.paymentDetails,
          gariNo: formValue.gariNo,
          details: formValue.details,
          voucherItems: formValue.voucherItems
        }).subscribe({
        next: () => {
          this.showSuccess('Sale voucher updated successfully');
          this.router.navigate(['/vouchers/sale']);
        },
        error: () => {
          this.showError('Error updating sale voucher');
        }
      });
    } else {
      this.voucherService.createVoucher({
          voucherType: VoucherType.Sale,
          customerId: formValue.customerId,
          paymentType: formValue.paymentType,
          bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
          paymentDetails: formValue.paymentDetails,
          gariNo: formValue.gariNo,
          details: formValue.details,
          voucherItems: formValue.voucherItems
        }).subscribe({
        next: () => {
          this.showSuccess('Sale voucher created successfully');
          this.router.navigate(['/vouchers/sale']);
        },
        error: () => {
          this.showError('Error creating sale voucher');
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
