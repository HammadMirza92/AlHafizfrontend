import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PaymentType } from '../../../core/models/enums.model';
import { CashTransactionFilter } from '../../../core/models/cash-transaction.model';
import { BankService } from '../../../core/services/bank.service';
import { Bank } from '../../../core/models/bank.model';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-cash-transaction-filter',
  templateUrl: './cash-transaction-filter.component.html',
  styleUrls: ['./cash-transaction-filter.component.scss']
})
export class CashTransactionFilterComponent implements OnInit {
  @Output() filterChanged = new EventEmitter<CashTransactionFilter>();
  filterForm:any;
  paymentTypes = Object.values(PaymentType);
  banks: Bank[] = [];
  customers: Customer[] = [];

  constructor(
    private fb: FormBuilder,
    private bankService: BankService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadBanks();
    this.loadCustomers();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      customerId: [null],
      paymentType: [null],
      bankId: [null],
      isCashReceived: [null],
      fromDate: [null],
      toDate: [null]
    });
  }

  loadBanks(): void {
    this.bankService.getBanks().subscribe(banks => {
      this.banks = banks;
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
    });
  }

  onSubmit(): void {
    debugger;
    const filter: CashTransactionFilter = {
      ...this.filterForm.value
    };
    this.filterChanged.emit(filter);
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.filterChanged.emit({});
  }
}
