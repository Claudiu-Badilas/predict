export interface InvoiceDto {
  type: string;
  provider: string;
  date: string;
  index: number;
  amount: number;
}

export interface LocationInvoiceDto {
  address: string;
  invoices: InvoiceDto[];
}

export class Invoice {
  type: string;
  provider: string;
  date: Date;
  index: number;
  amount: number;

  constructor(data: InvoiceDto) {
    this.type = data.type;
    this.provider = data.provider;
    this.date = new Date(data.date);
    this.index = data.index;
    this.amount = data.amount;
  }
}

export class LocationInvoice {
  address: string;
  invoices: Invoice[];

  constructor(data: LocationInvoiceDto) {
    this.address = data.address;
    this.invoices = data.invoices.map((inv) => new Invoice(inv));
  }
}
