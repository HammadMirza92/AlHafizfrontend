import { VoucherType, PaymentType } from './enums.model';
import { VoucherItem, CreateVoucherItem, UpdateVoucherItem } from './voucher-item.model';

export interface Voucher {
  id: number;
  voucherType: VoucherType;
  customerId?: number;
  customerName?: string;
  paymentType: PaymentType;
  bankId?: number;
  bankName?: string;
  paymentDetails?: string;
  expenseHeadId?: number;
  expenseHeadName?: string;
  amount?: number;
  gariNo?: string;
  details?: string;
  createdAt: Date;
  updatedAt?: Date;
  voucherItems?: VoucherItem[];
}

export interface CreateVoucher {
  voucherType: VoucherType;
  customerId?: number;
  paymentType: PaymentType;
  bankId?: number;
  paymentDetails?: string;
  expenseHeadId?: number;
  amount?: number;
  gariNo?: string;
  details?: string;
  voucherItems?: CreateVoucherItem[];
}

export interface UpdateVoucher {
  voucherType: VoucherType;
  customerId?: number;
  paymentType: PaymentType;
  bankId?: number;
  paymentDetails?: string;
  expenseHeadId?: number;
  amount?: number;
  gariNo?: string;
  details?: string;
  voucherItems?: UpdateVoucherItem[];
}

export interface VoucherFilter {
  fromDate?: Date;
  toDate?: Date;
  customerId?: number;
  expenseHeadId?: number;
  voucherType?: VoucherType;
}
