import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { VoucherService } from '../../../../core/services/voucher.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { ItemService } from '../../../../core/services/item.service';
import { BankService } from '../../../../core/services/bank.service';
import { VoucherType, PaymentType } from '../../../../core/models/enums.model';
import { Customer } from '../../../../core/models/customer.model';
import { Item } from '../../../../core/models/item.model';
import { Bank } from '../../../../core/models/bank.model';
import { CreateVoucher, UpdateVoucher } from '../../../../core/models/voucher.model';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { CustomerItemRateService } from 'src/app/core/services/customer-item-rate.service';
import { DatePipe } from '@angular/common';

// Interface for dropdown date options
interface DateOption {
  value: Date;
  display: string;
}

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss']
})
export class PurchaseFormComponent implements OnInit {
  availableDates: DateOption[] = [];
  readonly DATE_FORMAT = 'dd-MMM-yy';
  todayDate: Date = new Date();
  purchaseForm: FormGroup;
  isEditMode = false;
  voucherId: number | null = null;
  customers: Customer[] = [];
  items: Item[] = [];
  banks: Bank[] = [];
  paymentTypes = PaymentType;
  loading = false;
  submitting = false;
  customerRates: { [key: number]: number } = {};

  constructor(
    private formBuilder: FormBuilder,
    private voucherService: VoucherService,
    private customerService: CustomerService,
    private itemService: ItemService,
    private bankService: BankService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private customerItemRateService: CustomerItemRateService,
    private datePipe: DatePipe

  ) {
    this.purchaseForm = this.createForm();
  }
generateDateOptions(): void {
  const today = new Date();
  const daysInPast = 180;
  const daysInFuture = 30;

  this.availableDates = [];

  // Add dates from the past
  for (let i = daysInPast; i >= 1; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    this.availableDates.push({
      value: date,
      display: this.formatDate(date)
    });
  }

  // Add today
  this.availableDates.push({
    value: today,
    display: this.formatDate(today) + ' (Today)'
  });

  // Add future dates
  for (let i = 1; i <= daysInFuture; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    this.availableDates.push({
      value: date,
      display: this.formatDate(date)
    });
  }
  this.purchaseForm.get('voucherDate')?.setValue(today);

}
formatDate(date: Date): string {
  return this.datePipe.transform(date, this.DATE_FORMAT) || '';
}
  onCustomerChange(): void {
    const customerId = this.purchaseForm.get('customerId')?.value;
    if (customerId) {
      this.customerItemRateService.getRatesByCustomer(customerId).subscribe({
        next: (rates) => {
          this.customerRates = {};
          rates.forEach((rate: any) => {
            this.customerRates[rate.itemId] = rate.rate;
          });

          // Update rates for existing items
          this.updateAllItemRates();
        },
        error: (error) => {
          console.error('Error loading customer rates:', error);
        }
      });
    }
  }
  updateAllItemRates(): void {
    if (this.voucherItemsFormArray.length > 0) {
      for (let i = 0; i < this.voucherItemsFormArray.length; i++) {
        this.updateItemRate(i);
      }
    }
  }
  updateItemRate(index: number): void {
    const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
    const itemId = itemGroup.get('itemId')?.value;

    if (itemId && this.customerRates[itemId]) {
      itemGroup.get('rate')?.setValue(this.customerRates[itemId]);
      this.calculateAmount(index);
    }
  }
  onItemSelected(index: number): void {
    const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
    const itemId = itemGroup.get('itemId')?.value;
    const customerId = this.purchaseForm.get('customerId')?.value;

    if (itemId && customerId) {
      // Check if we already have loaded rates for this customer
      if (this.customerRates[itemId]) {
        itemGroup.get('rate')?.setValue(this.customerRates[itemId]);
        this.calculateAmount(index);
      } else {
        // If not in our cache, try to get it from the API
        this.customerItemRateService.getRateByCustomerAndItem(customerId, itemId).subscribe({
          next: (response: any) => {
            if (response && response.rate) {
              this.customerRates[itemId] = response.rate;
              itemGroup.get('rate')?.setValue(response.rate);
              this.calculateAmount(index);
            }
          },
          error: (error) => {
            console.error('Error getting rate:', error);
          }
        });
      }
    }
  }
  ngOnInit(): void {
    this.loadDependentData();
    this.generateDateOptions();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.voucherId = +id;
      this.loadPurchaseVoucher(this.voucherId);
    } else {
      // Add initial item for new vouchers
      this.addItem();
    }
  }
  getSelectedDateDisplay(): string {
  const dateValue = this.purchaseForm.get('voucherDate')?.value;
  if (!dateValue) return '';

  const selectedOption = this.availableDates.find(option =>
    option.value.getTime() === new Date(dateValue).getTime()
  );

  return selectedOption ? selectedOption.display : this.formatDate(new Date(dateValue));
}
 calculateFromFormula(index: number): void {
  const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
  const formula = itemGroup.get('formula')?.value;

  if (formula && formula.trim() !== '') {
    try {
      // Replace common math operations with their JavaScript equivalents
      const sanitizedFormula = formula
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/x/gi, '*');

      // Use JavaScript's eval to calculate the formula result
      // This is a simple implementation - in production, consider using a dedicated math parser library
      const result = Math.round(eval(sanitizedFormula) * 100) / 100;

      if (!isNaN(result) && isFinite(result)) {
        itemGroup.get('netWeight')?.setValue(result);
        // Also update amount calculation since netWeight changed
        this.calculateAmount(index);
      }
    } catch (error) {
      console.error('Error evaluating formula:', error);
      // Keep the previous netWeight if formula evaluation fails
    }
  } else {
    // If formula is empty, fall back to the weight-kat calculation
    // But don't update the formula field here, as it might be cleared intentionally
    const weight = itemGroup.get('weight')?.value || 0;
    const kat = itemGroup.get('kat')?.value || 0;
    const netWeight = Math.max(0, weight - kat);
    itemGroup.get('netWeight')?.setValue(netWeight);
    this.calculateAmount(index);
  }
}
  get voucherItemsFormArray(): FormArray {
    return this.purchaseForm.get('voucherItems') as FormArray;
  }

  createForm(): FormGroup {
    const currentDate = new Date();

    return this.formBuilder.group({
      customerId: [null, Validators.required],
      paymentType: [PaymentType.Cash, Validators.required],
      bankId: [null],
      paymentDetails: [''],
      gariNo: [''],
      details: [''],
      voucherDate: [currentDate, Validators.required],
      voucherItems: this.formBuilder.array([])
    });
  }

createVoucherItemFormGroup(item: any = null): FormGroup {
  const formGroup = this.formBuilder.group({
    id: [item?.id || 0],
    man: [0], // Add new 'man' field for frontend calculation only
    useFormula: [item?.formula ? true : false], // Checkbox to control formula usage
    itemId: [item?.itemId || null, Validators.required],
    weight: [item?.weight || 0, [Validators.required, Validators.min(0.01)]],
    kat: [item?.kat || 0, [Validators.required, Validators.min(0)]],
    formula: [item?.formula || ''],
    netWeight: [{ value: item?.netWeight || 0 }],
    desiMan: [item?.desiMan || 37.324, [Validators.required, Validators.min(0.01)]],
    rate: [item?.rate || 0, [Validators.required, Validators.min(0.01)]],
    amount: [item?.amount || 0, [Validators.required, Validators.min(0.01)]],
     isTrackStock: [true],
  });

  // Initialize formula if weight and kat already have values
  const weight = formGroup.get('weight')?.value || 0;
  const kat = formGroup.get('kat')?.value || 0;

  if (weight > 0 && !item?.formula) {
    const netWeightValue = Math.max(0, weight - kat);
    formGroup.get('formula')?.setValue(`${netWeightValue} / 37.324`);
  }

  return formGroup;
}
calculateWeightFromMan(index: number): void {
  const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
  const manValue = itemGroup.get('man')?.value || 0;

  // Conversion: 1 man = 40 kg (as per requirement example where 50 man = 2000 kg)
  const weightValue = manValue * 40;

  // Update the weight field
  itemGroup.get('weight')?.setValue(weightValue);

  // Recalculate net weight since weight has changed
  this.calculateNetWeight(index);
}
onFormulaCheckboxChange(index: number): void {
  const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
  const useFormula = itemGroup.get('useFormula')?.value;

  if (useFormula) {
    // Formula is now enabled - initialize it with default value if empty
    const weight = itemGroup.get('weight')?.value || 0;
    const kat = itemGroup.get('kat')?.value || 0;
    const rawNet = Math.max(0, weight - kat);
    const currentFormula = itemGroup.get('formula')?.value?.trim() || '';

    if (!currentFormula) {
      itemGroup.get('formula')?.setValue(`${rawNet} / 37.324`);
    }

    // Calculate using formula
    this.calculateFromFormula(index);
  } else {
    // Formula is now disabled - calculate using simple weight-kat
    const weight = itemGroup.get('weight')?.value || 0;
    const kat = itemGroup.get('kat')?.value || 0;
    const netWeight = Math.max(0, weight - kat);
    itemGroup.get('netWeight')?.setValue(netWeight);
    this.calculateAmount(index);
  }
}
  loadDependentData(): void {
    this.loading = true;
    forkJoin([
      this.customerService.getCustomers(),
      this.itemService.getItems(),
      this.bankService.getBanks()
    ]).subscribe({
      next: ([customers, items, banks]) => {
        this.customers = customers;
        this.items = items;
        this.banks = banks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dependent data:', error);
        this.showError('Error loading form data');
        this.loading = false;
      }
    });
  }
  // Inside your component class
  getSelectedPaymentType(): string {
    const selectedPaymentType = this.purchaseForm.get('paymentType')?.value;
    switch (selectedPaymentType) {
      case this.paymentTypes.Cash:
        return 'Cash';
      case this.paymentTypes.Bank:
        return 'Bank';
      case this.paymentTypes.Credit:
        return 'Credit';
      default:
        return '';
    }
  }

  loadPurchaseVoucher(id: number): void {
    this.loading = true;
    this.voucherService.getVoucher(id).subscribe({
      next: (voucher) => {
        if (voucher ) {
          const voucherDate = voucher.createdAt ? new Date(voucher.createdAt) : new Date();

          // Update form with voucher data
          this.purchaseForm.patchValue({
            customerId: voucher.customerId,
            paymentTypes: voucher.paymentType,
            bankId: voucher.bankId,
            paymentDetails: voucher.paymentDetails,
            gariNo: voucher.gariNo,
            details: voucher.details,
            voucherDate: voucherDate

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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading voucher:', error);
        this.showError('Error loading voucher');
        this.router.navigate(['/vouchers/purchase']);
        this.loading = false;
      }
    });
  }

  addItem(): void {
    const newItem = this.createVoucherItemFormGroup();
    this.voucherItemsFormArray.push(newItem);
  }

  removeItem(index: number): void {
    if (this.voucherItemsFormArray.length > 1) {
      this.voucherItemsFormArray.removeAt(index);
    } else {
      this.showError('At least one item is required');
    }
  }
calculateNetWeight(index: number): void {
  const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
  const weight = itemGroup.get('weight')?.value || 0;
  const kat = itemGroup.get('kat')?.value || 0;
  const formula = itemGroup.get('formula')?.value;

  const formulaControl = itemGroup.get('formula');
  const currentFormula = formulaControl?.value?.trim() || '';
  const rawNet = Math.max(0, weight - kat);
  const newAutoFormula = `${rawNet} / 37.324`;

  // Only update formula if it's empty or matches old structure
  const isManualFormula = currentFormula && !/^\d+(\.\d+)?\s*\/\s*37\.324$/.test(currentFormula);

  if (!isManualFormula) {
    // Set the useFormula checkbox to true since we're using the formula
    itemGroup.get('useFormula')?.setValue(true);

    formulaControl?.setValue(newAutoFormula);
    const result = Math.round((rawNet / 37.324) * 100) / 100;
    itemGroup.get('netWeight')?.setValue(result);
  } else {
    this.calculateFromFormula(index);
  }

  this.calculateAmount(index);
}

 calculateAmount(index: number): void {
    const itemGroup = this.voucherItemsFormArray.at(index) as FormGroup;
    const netWeight = itemGroup.get('netWeight')?.value || 0;
    const rate = itemGroup.get('rate')?.value || 0;

    // New formula: amount = netWeight * rate (instead of desiMan * rate)
    const amount = Math.round((netWeight * rate) * 100) / 100;
    itemGroup.get('amount')?.setValue(amount);
  }

  getTotalAmount(): number {
    let total = 0;
    for (let i = 0; i < this.voucherItemsFormArray.length; i++) {
      const itemGroup = this.voucherItemsFormArray.at(i) as FormGroup;
      total += Number(itemGroup.get('amount')?.value || 0);
    }
    return total;
  }

  getTotalWeight(): number {
    let total = 0;
    for (let i = 0; i < this.voucherItemsFormArray.length; i++) {
      const itemGroup = this.voucherItemsFormArray.at(i) as FormGroup;
      total += itemGroup.get('weight')?.value || 0;
    }
    return total;
  }

  getTotalNetWeight(): number {
    let total = 0;
    for (let i = 0; i < this.voucherItemsFormArray.length; i++) {
      const itemGroup = this.voucherItemsFormArray.at(i) as FormGroup;
      total += itemGroup.get('netWeight')?.value || 0;
    }
    return total;
  }

  getSelectedCustomerName(): string {
    const customerId = this.purchaseForm.get('customerId')?.value;
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : '';
  }

  getSelectedBankName(): string {
    const bankId = this.purchaseForm.get('bankId')?.value;
    const bank = this.banks.find(b => b.id === bankId);
    return bank ? bank.name : '';
  }

  isFormValid(): boolean {
    return this.purchaseForm.valid && this.voucherItemsFormArray.length > 0;
  }

 onSubmit(): void {
  if (!this.isFormValid()) {
    this.purchaseForm.markAllAsTouched();
    this.markFormArrayAsTouched();
    this.showError('Please fill in all required fields');
    return;
  }

  this.submitting = true;
  const formValue = this.purchaseForm.getRawValue();
const voucherDate = formValue.voucherDate instanceof Date
    ? formValue.voucherDate
    : new Date(formValue.voucherDate);
  const voucherData = {
    voucherType: VoucherType.Purchase,
    customerId: formValue.customerId,
    paymentType: formValue.paymentType,
    bankId: formValue.paymentType === PaymentType.Bank ? formValue.bankId : null,
    paymentDetails: formValue.paymentDetails,
    gariNo: formValue.gariNo,
    details: formValue.details,
    isTrackStock: formValue.isTrackStock,
    createdAt: voucherDate,
    voucherItems: formValue.voucherItems.map((item: any) => {
      // Create a new object without the 'man' and 'useFormula' fields
      const { man, useFormula, ...itemWithoutFrontendFields } = item;
      return {
        ...itemWithoutFrontendFields,
        id: this.isEditMode ? item.id : undefined
      };
    })
  };

  const operation = this.isEditMode && this.voucherId
    ? this.voucherService.updateVoucher(this.voucherId, voucherData)
    : this.voucherService.createVoucher(voucherData);

  operation.subscribe({
    next: () => {
      const message = this.isEditMode
        ? 'Purchase voucher updated successfully'
        : 'Purchase voucher created successfully';
      this.showSuccess(message);
      this.router.navigate(['/vouchers/purchase']);
    },
    error: (error) => {
      console.error('Error saving voucher:', error);
      const message = this.isEditMode
        ? 'Error updating purchase voucher'
        : 'Error creating purchase voucher';
      this.showError(message);
      this.submitting = false;
    }
  });
}

  private markFormArrayAsTouched(): void {
    this.voucherItemsFormArray.controls.forEach(control => {
      control.markAllAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'success' },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.openFromComponent(AlertComponent, {
      data: { message, type: 'error' },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  goBack(): void {
    this.router.navigate(['/vouchers/purchase']);
  }
}
