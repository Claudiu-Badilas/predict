import { DateUtils } from 'src/app/shared/utils/date.utils';

export interface InvoiceDto {
  invoiceType: string;
  provider: string;
  date: string;
  index: number;
  amount: number;
  type: string;
  action: string;
}

export interface LocationInvoiceDto {
  address: string;
  invoices: InvoiceDto[];
}

export class Invoice {
  invoiceType: string;
  provider: string;
  date: Date;
  index: number;
  amount: number;
  type: 'Payment' | 'Index Update';
  action: 'MANUIAL' | 'SCHEDULED';

  constructor(data: InvoiceDto) {
    Object.assign(this, data);

    this.date = DateUtils.fromSplittedStringToJsDate(data.date);
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
