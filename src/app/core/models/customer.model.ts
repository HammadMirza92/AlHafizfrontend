export interface Customer {
  id: number;
  name: string;
  description?: string;
  phoneNumber?: string;
}

export interface CreateCustomer {
  name: string;
  description?: string;
  phoneNumber?: string;
}

export interface UpdateCustomer {
  name: string;
  description?: string;
  phoneNumber?: string;
}
