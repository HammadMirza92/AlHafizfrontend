import { PaymentType } from './enums.model';

export interface CashTransaction {
  id: number;
  customerId?: number;
  customerName?: string;
  paymentType: PaymentType;
  bankId?: number;
  bankName?: string;
  paymentDetails?: string;
  amount: number;
  isCashReceived: boolean;
  details?: string;
  createdAt: Date;
}

export interface CreateCashTransaction {
  customerId?: number;
  paymentType: PaymentType;
  bankId?: number;
  paymentDetails?: string;
  amount: number;
  isCashReceived: boolean;
  details?: string;
}

export interface CashTransactionFilter {
  fromDate?: Date;
  toDate?: Date;
  customerId?: number;
  isCashReceived?: boolean;
}
