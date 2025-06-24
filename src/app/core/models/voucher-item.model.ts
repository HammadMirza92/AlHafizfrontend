export interface VoucherItem {
  id: number;
  voucherId: number;
  itemId: number;
  itemName?: string;
  weight: number;
  kat: number;
  netWeight: number;
  desiMan: number;
  rate: number;
  amount: number;
}

export interface CreateVoucherItem {
  itemId: number;
  weight: number;
  kat: number;
  netWeight: number;
  desiMan: number;
  rate: number;
  amount: number;
}

export interface UpdateVoucherItem {
  id: number;
  itemId: number;
  weight: number;
  kat: number;
  netWeight: number;
  desiMan: number;
  rate: number;
  amount: number;
}
