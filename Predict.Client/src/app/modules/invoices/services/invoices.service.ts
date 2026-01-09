import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LocationInvoice, LocationInvoiceDto } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  constructor(private httpClient: HttpClient) {}

  getInvoices(startDate: Date, endDate: Date): Observable<LocationInvoice[]> {
    return this.httpClient
      .get<LocationInvoiceDto[]>(
        `/server/api/v1/invoices?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      .pipe(map((res) => res.map((data) => new LocationInvoice(data))));
  }
}
